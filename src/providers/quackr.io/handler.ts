import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../helpers.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://quackr.io/temporary-numbers';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/${Countries[country as keyof typeof Countries]}`;
};

const getPhoneNumberUrl = (country: Country, phone: string) => {
  const withCountryCode = country === 'USA' && !phone.startsWith('+') && !phone.startsWith('1') ? `1${phone}` : phone;
  return `${getCountryUrl(country)}/${withCountryCode.replace('+', '')}`;
};

export const getQuackrIoPhones = async (
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

  const { numbers } = await parseNumbersPage(url, page);

  return {
    phones: numbers.map((phone) => ({ phone, url: getPhoneNumberUrl(country, phone) })),
    nextPageUrl: ''
  };
};

const parseNumbersPage = async (url: string, page: Page): Promise<{ numbers: string[]; nextPageUrl?: string }> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}`);

  const getPhones = async (attempt = 1): Promise<string[]> => {
    await page.waitForSelector('country-page section', { timeout: 5000 });
    const availablePhonesLocator = '.columns.is-multiline';
    const phoneNumberElementsLocator = `${availablePhonesLocator} p.title.is-5-small.mb-1 a`;
    const phones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
      elements.map((el) => el?.textContent?.trim())
    );
    if (!phones.length && attempt <= 3) {
      await delay(1.5);
      return await getPhones(attempt + 1);
    }

    return phones as string[];
  };

  const currentPagePhones = await getPhones();

  const numbers = currentPagePhones
    .filter((phone) => Boolean(phone))
    .map((phone) => (phone as string).replace('+1', ''));

  return { numbers };
};

const numberIsOnline = async (page: Page, country: Country, phoneNumber: string) => {
  const url = getPhoneNumberUrl(country, phoneNumber);

  await page.goto(url);

  await page.waitForSelector('messages');

  try {
    await page.$eval(`messages h2`, (h2) => h2?.textContent?.trim());
    return false;
  } catch (e) {
    return true;
  }
};

const parseMessages = async (page: Page) => {
  const rowLocator = 'table > tbody > tr';

  const messageRows =
    (await page.$$eval(rowLocator, (rows) =>
      rows.map((row) => {
        const getTdText = (row: HTMLTableRowElement, index: number) => row.children?.item(index)?.textContent ?? '';
        return [getTdText(row, 0), getTdText(row, 1), getTdText(row, 2)];
      })
    )) ?? [];

  const unparsedRows = messageRows.map((row) => row?.filter((x) => x?.trim()));

  return unparsedRows
    .map((row) => {
      const [ago, , message] = row;
      const agoParsed = parseTimeAgo(ago ?? '');

      return {
        ago: agoParsed,
        agoText: ago,
        message,
        url: page.url()
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

  await page.reload();
  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleQuackrIo = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);
  const isAlive = await numberIsOnline(page, options.country, options.phoneNumber);

  if (!isAlive) {
    throw new Error('number is offline');
  }

  consola.success(`number ${options.phoneNumber} is online`);

  await delay(1.5);
  const match = await recursivelyCheckMessages(
    page,
    options.askedOtpAt || 0,
    options.matcher,
    options?.interval || defaultRecheckDelay
  );

  return match;
};
