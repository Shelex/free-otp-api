import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumber } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../parseOtp.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../countries.js';

const baseUrl = 'https://quackr.io/temporary-numbers';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported in ${baseUrl}`);
  }

  return `${baseUrl}/${Countries[country as keyof typeof Countries]}`;
};

const getPhoneNumberUrl = (country: Country, phone: string) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported`);
  }

  return `${getCountryUrl(country)}/${phone.replace('+', '')}`;
};

export const getQuackrIoPhones = async (page: Page, country: Country): Promise<PhoneNumber[]> => {
  consola.start(`starting parsing numbers for ${country}`);
  const url = getCountryUrl(country);

  consola.success(`got url ${url}`);

  await page.goto(url);

  const numbers = await parseNumbersPage(page);

  return numbers.map((phone) => ({ phone, url: getPhoneNumberUrl(country, phone) }));
};

const parseNumbersPage = async (page: Page, phones: string[] = []): Promise<string[]> => {
  consola.start(`parsing page...`);
  await page.waitForSelector('country-page', { timeout: 5000 });

  const availablePhonesLocator = '.columns.is-multiline:nth-child(4)';
  await page.waitForSelector(availablePhonesLocator, { timeout: 5000 });

  const phoneNumberElementsLocator = `${availablePhonesLocator} p.title.is-5-small.mb-1 a`;
  const currentPagePhones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => el?.textContent?.trim())
  );

  const currentPhones = currentPagePhones
    .filter((phone) => Boolean(phone))
    .map((phone) => (phone as string).replace('+1', ''));

  phones.push(...currentPhones);

  return phones;
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

  return unparsedRows.map((row) => {
    const [ago, , message] = row;
    const agoParsed = parseTimeAgo(ago ?? '');

    return {
      ago: agoParsed,
      agoText: ago,
      message,
      url: page.url()
    } as Message;
  });
};

export const recursivelyCheckMessages = async (
  page: Page,
  askedAt: number,
  matcher: string | string[],
  recheckDelay: number
): Promise<Message | Message[]> => {
  await page.waitForNetworkIdle({ idleTime: 500 });

  const parsed = (await parseMessages(page)) || [];

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

  await delay(3);
  const match = await recursivelyCheckMessages(
    page,
    options.askedOtpAt || 0,
    options.matcher,
    options?.interval || defaultRecheckDelay
  );

  const areMultipleMatches = Array.isArray(match);

  !areMultipleMatches && match && consola.success(`found otp message ${match.agoText}: "${match.message}"`);
  areMultipleMatches && consola.success(`found ${match.length} otp messages`);

  return areMultipleMatches ? match.shift() : match;
};
