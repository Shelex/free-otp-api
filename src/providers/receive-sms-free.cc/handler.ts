import { Page } from 'puppeteer';
import { consola } from 'consola';
import { tryParseOtpCode } from '../helpers.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { countries, Countries } from './countries.js';
import type { OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://receive-sms-free.cc';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/Free-${Countries[country as keyof typeof Countries]}-Phone-Number/`;
};

const getPhoneNumberUrl = (country: Country, phone: string) => {
  const withCountryCode = country === 'USA' && !phone.startsWith('+') && !phone.startsWith('1') ? `1${phone}` : phone;
  return `${getCountryUrl(country)}${withCountryCode.replace('+', '')}/`;
};

const numberIsOnline = async (page: Page, country: Country, phoneNumber: string) => {
  const url = getPhoneNumberUrl(country, phoneNumber);

  const result = await page.goto(url);

  return !!result;
};

export interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp?: string;
  url: string;
}

const parseMessages = async (page: Page) => {
  const currentUrl = page.url();
  const rowLocator = '.casetext > .row';

  const messageRows = await page.$$eval(rowLocator, (rows) =>
    rows.map((row) => ({
      ago: row.children[1]?.textContent ?? '',
      message: row.children[2]?.textContent ?? ''
    }))
  );

  return messageRows
    .filter((row) => row.ago.length && row.message.length)
    .map((row) => {
      const agoParsed = parseTimeAgo(row.ago);

      return {
        ago: agoParsed,
        agoText: row.ago,
        message: row.message,
        url: currentUrl
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
      ...{ otp: tryParseOtpCode(match.message) }
    }));
  }

  const match = matches.at(0);

  if (match) {
    match.otp = tryParseOtpCode(match.message);
    return match;
  }

  consola.info(
    `not found message within ${stringifyTriggerOtpTimeDiff(askedAt)} range, latest ${
      parsed.shift()?.agoText
    }, will try after ${recheckDelay}s...`
  );

  const buttons = await page.$$('.btn-primary');

  await buttons.at(0)?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleReceiveSmsFreeCC = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);
  const isAlive = await numberIsOnline(page, options.country, options.phoneNumber);
  if (!isAlive) {
    throw new Error('number is offline');
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

export const getReceiveSmsFreePhones = async (
  page: Page,
  country: Country,
  nextUrl?: string
): Promise<PhoneNumberListReply> => {
  consola.start(`starting parsing numbers for ${country.toString()}`);
  const url = nextUrl ?? getCountryUrl(country);

  consola.success(`got url ${url}`);

  if (!url) {
    return { phones: [] };
  }

  const { numbers, nextPageUrl } = await parseNumbersPage(page, country, url);

  return {
    phones: numbers.map((phone) => ({ phone, url: getPhoneNumberUrl(country, phone) })),
    nextPageUrl
  };
};

const elementExist = async (page: Page, locator: string) => {
  return (await page.$(locator).catch(() => null)) !== null;
};

const parseNumbersPage = async (
  page: Page,
  country: Country,
  url: string
): Promise<{ numbers: string[]; nextPageUrl?: string }> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('.section04 .index-title', { timeout: 5000 });
  await page.waitForSelector('.layout .index-case', { timeout: 5000 });
  await delay(1);

  const phoneNumberElementsLocator = 'li a[href] > h2 > span';
  const currentPagePhones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => el?.textContent)
  );

  const numbers = currentPagePhones
    .filter((phone) => Boolean(phone))
    .map((phone) => (phone as string).replace('+1', '').replaceAll(' ', ''));

  const paginationLocator = '.pagination > li.active + li a';

  const nextPageAvailable = await elementExist(page, paginationLocator);

  if (!nextPageAvailable) {
    return { numbers };
  }
  consola.success(`can see pagination element`);

  const nextPageFromPagination = await page.$eval(paginationLocator, (el) => el?.href);

  if (!nextPageFromPagination || nextPageFromPagination === url) {
    return { numbers };
  }

  const nextPageHtml = nextPageFromPagination.split('/').pop();

  if (!nextPageHtml) {
    return { numbers };
  }

  const nextPageUrl = `${getCountryUrl(country)}${nextPageHtml}`;

  if (nextPageUrl === url) {
    return { numbers };
  }

  return {
    numbers,
    nextPageUrl
  };
};
