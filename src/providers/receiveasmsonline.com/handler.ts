import { Page } from 'puppeteer';
import { consola } from 'consola';
import { tryParseOtpCode } from '../helpers.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { countries, Countries } from './countries.js';
import type { OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://receiveasmsonline.com';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/${Countries[country as keyof typeof Countries]}/`;
};

const getPhoneNumberUrl = (country: Country, phone: string) => {
  const withCountryCode = country === 'USA' && !phone.startsWith('+') && !phone.startsWith('1') ? `1${phone}` : phone;
  return `${getCountryUrl(country)}${withCountryCode.replace('+', '')}/`;
};

const numberIsOnline = async (page: Page, country: Country, phoneNumber: string) => {
  const url = getPhoneNumberUrl(country, phoneNumber);
  return await page.goto(url);
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
  const rowLocator = 'div[class*="Telephone__Message-"]';

  const messageRows = await page.$$eval(rowLocator, (rows) =>
    rows.map((row) => ({
      message: row.children[0]?.children[0]?.textContent ?? '',
      from: row.children[1]?.children[0]?.textContent ?? '',
      ago: row.children[1]?.children[1]?.textContent ?? ''
    }))
  );

  const parseDateString = (dateString: string) => {
    const formatted = dateString.trim().replace(/\s/g, '-').replace('---', 'T');
    return Date.parse(formatted);
  };

  return messageRows
    .filter((row) => row.ago.length && row.message.length)
    .map((row) => {
      const agoParsed = row.ago && !row.ago.includes('ago') ? parseDateString(row.ago) : parseTimeAgo(row.ago);

      return {
        ago: agoParsed,
        agoText: row.ago,
        message: `${row.from} ${row.message}`,
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
  await delay(3);

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

export const handleReceiveSmsOnlineCom = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);
  const isAlive = await numberIsOnline(page, options.country, options.phoneNumber);
  if (!isAlive) {
    throw new Error('number is offline');
  }

  await delay(1.5);

  consola.success(`number ${options.phoneNumber} is online`);

  const match = await recursivelyCheckMessages(
    page,
    options.askedOtpAt || 0,
    options.matcher,
    options?.interval || defaultRecheckDelay
  );

  return match;
};

export const getReceiveSmsOnlineComPhones = async (
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

  const { phones, nextPageUrl } = await parseNumbersPage(url, page, country);

  return {
    phones,
    nextPageUrl
  };
};

const parseNumbersPage = async (url: string, page: Page, country: Country): Promise<PhoneNumberListReply> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('#country-container', { timeout: 5000 });
  const numberGridLocator = 'div[class*="Country__NumberGrid"]';
  await page.waitForSelector(numberGridLocator, { timeout: 5000 });
  await delay(1);

  const phonesLocator = `${numberGridLocator} a[href^="/${Countries[country as keyof typeof Countries]}"]`;
  const phones = await page.$$eval(
    phonesLocator,
    (links, baseUrl) =>
      links
        .map((link) => {
          return {
            phone: link.getAttribute('href')?.trim()?.split('/')?.at(2) ?? '',
            url: `${baseUrl}${link?.getAttribute('href')}`
          };
        })
        .filter((record) => record.phone.length >= 10 || record.phone.length <= 13),
    baseUrl
  );

  return {
    phones
  };
};
