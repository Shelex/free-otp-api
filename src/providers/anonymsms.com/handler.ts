import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumber } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../parseOtp.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../countries.js';

const baseUrl = 'https://anonymsms.com';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported in ${baseUrl}`);
  }

  return `${baseUrl}/${Countries[country as keyof typeof Countries]}/`;
};

const getPhoneNumberUrl = (country: Country, phone: string) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported`);
  }

  return `${baseUrl}/number/${phone.replace('+', '')}/`;
};

export const getAnonymSmsPhones = async (page: Page, country: Country): Promise<PhoneNumber[]> => {
  consola.start(`starting parsing numbers for ${country}`);
  const url = getCountryUrl(country);

  consola.success(`got url ${url}`);

  await page.goto(url);

  const numbers = await parseNumbersPage(page);

  return numbers.map((phone) => ({ phone, url: getPhoneNumberUrl(country, phone) }));
};

const parseNumbersPage = async (page: Page, phones: string[] = []): Promise<string[]> => {
  consola.start(`parsing page...`);
  await page.waitForSelector('.sms-group', { timeout: 5000 });
  const phoneNumberElementsLocator = '.sms-card__number > a';
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

  await page.waitForSelector('.sim-info');

  const status = await page.$eval(`.sim-info__status`, (span) => span?.textContent?.trim());

  return status === 'Online';
};

const parseMessages = async (page: Page) => {
  const rowLocator = 'table.table-panel tr[data-message]';

  const messageRows = (await page.$$eval(rowLocator, (rows) => rows.map((row) => row.textContent))) as string[];

  const unparsedRows = messageRows.map((row) => row.split('\n').filter((x) => x.trim()));

  return unparsedRows.map((row) => {
    const ago = row[2].trim().toLowerCase();
    const agoParsed = parseTimeAgo(ago);

    return {
      ago: agoParsed,
      agoText: ago,
      message: row[1].trim(),
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

  const buttons = await page.$$('section.about .btn-group a');

  await buttons.at(0)?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleAnonymSms = async (page: Page, options: OtpRouteHandlerOptions) => {
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

  const areMultipleMatches = Array.isArray(match);

  !areMultipleMatches && match && consola.success(`found otp message ${match.agoText}: "${match.message}"`);
  areMultipleMatches && consola.success(`found ${match.length} otp messages`);

  return areMultipleMatches ? match.shift() : match;
};