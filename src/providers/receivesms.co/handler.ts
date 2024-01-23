import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../helpers.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://www.receivesms.co';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/${Countries[country as keyof typeof Countries]}/`;
};

export const getReceiveSmsCoPhones = async (page: Page, country: Country, nextUrl?: string) => {
  consola.start(`starting parsing numbers for ${country.toString()}`);
  const url = nextUrl ?? getCountryUrl(country);

  consola.success(`got url ${url}`);

  if (!url) {
    return { phones: [] };
  }

  return await parseNumbersPage(url, page);
};

const parseNumbersPage = async (url: string, page: Page, target?: string): Promise<PhoneNumberListReply> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('nav ul', { timeout: 5000 });
  const phoneNumberRowsLocator = '.row table tbody tr';

  const phones = await page.$$eval(phoneNumberRowsLocator, (rows) =>
    rows.map((row) => {
      const rowChildren = Array.from(row.children);
      const [, , phone, , link] = rowChildren;
      return {
        phone: phone?.textContent?.trim()?.replace('+1', '') ?? '',
        url: link?.querySelector('a')?.href?.trim()?.replace('receivesms.org', 'receivesms.co') ?? ''
      };
    })
  );

  if (target) {
    const phone = phones.find((item) => item.phone === target.replace('+1', ''));
    if (phone?.url) {
      consola.info(`returning phone ${phone?.phone} with url ${phone?.url}`);
      await page.goto(phone.url);
      await page.waitForSelector('div button b');
      return { phones: [phone] };
    }

    return { phones: [] };
  }

  const paginationLocator = 'nav ul.pagination li a';
  const links = await page.$$eval(paginationLocator, (elements) => elements.map((a) => a.href));

  const linkIsNotNextPage = (link?: string) => !link || link === page.url() || link === '#';

  if (links.length > 3) {
    const nextPageUrl = links.at(-2);

    if (linkIsNotNextPage(nextPageUrl)) {
      return { phones };
    }

    return { phones, nextPageUrl };
  }

  return { phones };
};

const numberIsOnline = async (
  page: Page,
  country: Country,
  phoneNumber: string,
  pageUrl?: string
): Promise<{ online: boolean; nextPageUrl?: string }> => {
  consola.info(`numberIsOnline, country: ${country.toString()}, phoneNumber: ${phoneNumber}`);
  const url = pageUrl ?? getCountryUrl(country);
  consola.success(`got country url ${url}`);

  if (!url) {
    return { online: false };
  }
  const { phones, nextPageUrl } = await parseNumbersPage(url, page, phoneNumber);
  const [found] = phones;

  const phoneMatch = found.phone === (country === 'USA' ? phoneNumber.replace('+1', '') : phoneNumber.replace('+', ''));

  if (!found.url || !phoneMatch) {
    return {
      online: false,
      nextPageUrl
    };
  }

  consola.success(`found url ${found.url}`);
  await page.goto(found.url);

  await page.waitForSelector('div button b');

  const status = await page.$eval(`div#msgtbl`, (table) => !!table);

  return { online: status };
};

const parseMessages = async (page: Page) => {
  const rowLocator = 'div#msgtbl > div';

  const messageRows = (await page.$$eval(rowLocator, (rows) => rows.map((row) => row.textContent))) as string[];

  const unparsedRows = messageRows.map((row) => row.split('\n').filter((x) => x?.trim()));

  return unparsedRows
    .map((row) => {
      const [sender, ago, ...messages] = row.map((td) => td?.trim());

      const isGoogleAds = sender === 'ADSFrom Google Ads';
      const sanitizedAgo = ago.replace(' ', '').replace('ago', ' ago').trim();
      const agoParsed = parseTimeAgo(sanitizedAgo);

      return {
        ago: isGoogleAds ? 0 : agoParsed,
        agoText: sanitizedAgo,
        message: messages.join(' ').split('- -').pop()
      } as Message;
    })
    .filter((message) => message.ago);
};

const recursivelyCheckMessages = async (
  page: Page,
  askedAt: number,
  matcher: string | string[],
  recheckDelay: number
): Promise<Message | Message[]> => {
  await page.waitForNetworkIdle({ idleTime: 500 });

  const parsed = (await parseMessages(page)) || [];
  if (!parsed.length) {
    return [];
  }

  const matches = parsed.filter(
    (parsed) =>
      parsed?.ago >= askedAt &&
      (Array.isArray(matcher) ? matcher.some((m) => parsed?.message?.includes(m)) : parsed?.message?.includes(matcher))
  );

  if (matches.length) {
    return matches.map((match) => ({
      ...match,
      ...{ otp: tryParseOtpCode(match.message), url: page.url() }
    }));
  }

  const match = matches.at(0);

  if (match) {
    match.otp = tryParseOtpCode(match.message);
    match.url = page.url();
    return match;
  }

  consola.info(
    `not found message within ${stringifyTriggerOtpTimeDiff(askedAt)} range, latest ${
      parsed.shift()?.agoText
    }, will try after ${recheckDelay}s...`
  );

  const updateButton = await page.$('div button b');

  await updateButton?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleReceiveSmsCo = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);

  const lookupStatus = async (url?: string): Promise<boolean> => {
    const { online, nextPageUrl } = await numberIsOnline(page, options.country, options.phoneNumber, url);
    if (!online && nextPageUrl) {
      return await lookupStatus(nextPageUrl);
    }
    return online;
  };

  const isAlive = await lookupStatus();

  if (!isAlive) {
    throw new Error(`number ${options.phoneNumber} is not found or is offline`);
  }

  consola.success(`number ${options.phoneNumber} is online`);

  const match = await recursivelyCheckMessages(
    page,
    options.askedOtpAt || 0,
    options.matcher,
    options?.interval || defaultRecheckDelay
  );

  return match;
};
