import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../helpers.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://temp-number.com';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/countries/${Countries[country as keyof typeof Countries]}`;
};

const getPhoneNumberUrl = (country: Country, value: string) => {
  if (!countries.includes(country)) {
    return '';
  }
  return `${baseUrl}/temporary-numbers/${Countries[country as keyof typeof Countries]}/${value.replace('+', '')}/1`;
};

export const openPage = async (page: Page, url: string) => {
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  );
  await page.goto(url);

  try {
    await page.waitForSelector('iframe', { timeout: 10000 });
    await page.waitForFunction(() => document.querySelector('.lds-ring'), { timeout: 30000 });
    await page.waitForFunction(() => !document.querySelector('.lds-ring'), { timeout: 45000 });
  } catch (e) {
    console.log(`openPage:error handling cloudflare: ${JSON.stringify(e, null, 2)}`);
    return;
  }
};

export const getTempNumberComPhones = async (page: Page, country: Country, nextUrl?: string) => {
  consola.start(`starting parsing numbers for ${country.toString()}`);
  const url = nextUrl ?? getCountryUrl(country);
  consola.success(`got url ${url}`);

  if (!url) {
    return { phones: [] };
  }

  return await parseNumbersPage(url, page);
};

const parseNumbersPage = async (url: string, page: Page, target?: string): Promise<PhoneNumberListReply> => {
  await openPage(page, url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('.container', { timeout: 15000 });
  const phoneNumberRowsLocator = 'a.country-link';

  const phones = await page.$$eval(phoneNumberRowsLocator, (links) =>
    links.map((link) => {
      const formatPhoneNumber = (phone?: string) =>
        (phone?.startsWith('1') ? phone?.slice(1) : phone)?.replace('+', '');
      return {
        phone: formatPhoneNumber(link?.querySelector('h4.card-title')?.textContent?.trim()) ?? '',
        url: link?.href?.trim() ?? ''
      };
    })
  );

  if (target) {
    const phone = phones.find((item) => item.phone === target.replace('+', ''));
    if (phone?.url) {
      consola.info(`returning phone ${phone?.phone} with url ${phone?.url}`);
      await openPage(page, url);
      await page.waitForSelector('.about__number-info');
      return { phones: [phone] };
    }

    return { phones: [] };
  }

  const paginationLocator = 'center a.btn-pagination';
  const links = await page.$$eval(paginationLocator, (elements) => elements.map((a) => a.href));

  const linkIsNotNextPage = (link?: string) => !link || link === page.url();

  const nextPageUrl = links.at(-1);

  if (linkIsNotNextPage(nextPageUrl)) {
    return { phones };
  }

  return { phones, nextPageUrl };
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
  await openPage(page, url);

  await page.waitForSelector('.about__number-info');

  const status = await page.$eval(`.sim-info .sim-info__status`, (el) => el?.textContent?.includes('Active'));

  return { online: !!status };
};

const parseMessages = async (page: Page) => {
  const rowLocator = '#messages .direct-chat-msg';

  const messageRows = await page.$$eval(rowLocator, (rows) =>
    rows.map((row) => ({
      ago: row.querySelector('time.timeago')?.textContent?.trim(),
      message: row.querySelector('.direct-chat-text')?.textContent?.trim()
    }))
  );

  return messageRows
    .map(({ ago, message }) => {
      const sanitizedAgo = ago?.replace(' ', '').replace('ago', ' ago').trim() ?? '';
      const agoParsed = parseTimeAgo(sanitizedAgo);

      return {
        ago: agoParsed,
        agoText: sanitizedAgo,
        message
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

  const updateButton = await page.$('.about__content a[href="#"]');

  await updateButton?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleTempNumberCom = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);

  const { online } = await numberIsOnline(
    page,
    options.country,
    options.phoneNumber,
    getPhoneNumberUrl(options.country, options.phoneNumber)
  );

  if (!online) {
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
