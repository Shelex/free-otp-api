import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../helpers.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://smstome.com';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/country/${Countries[country as keyof typeof Countries]}`;
};

export const getSmsToMeComPhones = async (page: Page, country: Country, nextUrl?: string) => {
  consola.start(`starting parsing numbers for ${country.toString()}`);
  const url = nextUrl ?? getCountryUrl(country);

  consola.success(`got url ${url}`);

  if (!url) {
    return { phones: [] };
  }

  return await parseNumbersPage(url, page);
};

const elementExist = async (page: Page, locator: string) => {
  return (await page.$(locator).catch(() => null)) !== null;
};

const parseNumbersPage = async (url: string, page: Page, target?: string): Promise<PhoneNumberListReply> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('section.container', { timeout: 5000 });
  const phoneNumberElementsLocator = 'div.row a';
  const phones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => ({ url: el?.href?.trim(), phone: el?.textContent?.trim()?.replace('+1', '') ?? '' }))
  );

  if (target) {
    const phone = phones.find((phone) => phone.url.includes(target.replace('+', '')));
    if (phone?.url) {
      consola.info(`returning phone ${phone?.phone} with url ${phone?.url}`);
      await page.goto(phone.url);
      await page.waitForSelector('h1.title');
      return { phones: [phone] };
    }
  }

  const paginationLocator = 'div.pagination a';
  const hasPagination = await elementExist(page, paginationLocator);

  if (!hasPagination) {
    return { phones };
  }

  const activePageLocator = 'div.pagination a.active';
  const activePageText = await page.$eval(activePageLocator, (el) => el?.textContent?.trim());
  if (!activePageText) {
    return { phones };
  }

  const links = await page.$$eval(paginationLocator, (elements) => elements.map((a) => a.href));

  const next = links.find((link) => link.endsWith(`page=${parseInt(activePageText ?? '0') + 1}`));
  if (!next || next === page.url()) {
    return { phones };
  }

  return { phones, nextPageUrl: next };
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

  const phoneMatch = found?.phone && found.phone === (country === 'USA' ? phoneNumber.replace('+1', '') : phoneNumber);

  if (!found.url || !phoneMatch) {
    return {
      online: false,
      nextPageUrl
    };
  }

  consola.success(`found url ${found.url}`);
  await page.goto(found.url);

  await page.waitForSelector('h1.title');

  const status = await page.$eval(`table.messagesTable`, (table) => !!table);

  return { online: status };
};

const parseMessages = async (page: Page) => {
  const rowLocator = 'table.messagesTable tr';

  const messageRows = await page.$$eval(rowLocator, (rows) =>
    rows.map((row) => Array.from(row.querySelectorAll('td')).map((td) => td?.textContent?.trim()))
  );

  return messageRows
    .map((row) => {
      const [, ago, ...messages] = row;
      const agoParsed = parseTimeAgo(ago);

      return {
        ago: agoParsed,
        agoText: ago,
        message: messages.join(' ')
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
  await page.waitForNetworkIdle({ idleTime: 2500 });

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

  const buttons = await page.$$('section.container > button');

  await buttons.at(0)?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleSmsToMe = async (page: Page, options: OtpRouteHandlerOptions) => {
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
