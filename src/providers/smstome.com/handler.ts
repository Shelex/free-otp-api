import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumber } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../parseOtp.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://smstome.com';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported in ${baseUrl}`);
  }

  return `${baseUrl}/country/${Countries[country as keyof typeof Countries]}`;
};

export const getSmsToMeComPhones = async (page: Page, country: Country) => {
  consola.start(`starting parsing numbers for ${country}`);
  const url = getCountryUrl(country);

  consola.success(`got url ${url}`);

  await page.goto(url);

  const numbers = await parseNumbersPage(page);

  return numbers;
};

const parseNumbersPage = async (page: Page, target?: string, phones: PhoneNumber[] = []): Promise<PhoneNumber[]> => {
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('section.container', { timeout: 5000 });
  const phoneNumberElementsLocator = 'div.row a';
  const currentPagePhones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => ({ url: el?.href?.trim(), phone: el?.textContent?.trim()?.replace('+1', '') ?? '' }))
  );
  phones.push(...currentPagePhones);

  if (target) {
    const phone = phones.find((phone) => phone.url.includes(target.replace('+', '')));
    if (phone?.url) {
      consola.info(`returning phone ${phone?.phone} with url ${phone?.url}`);
      await page.goto(phone.url);
      await page.waitForSelector('h1.title');
      return [phone];
    }
  }
  const paginationLocator = 'div.pagination > a';
  const links = await page.$$eval(paginationLocator, (elements) => elements.map((a) => a.href));
  const next = links.at(-1);
  if (!next) {
    return phones;
  }
  await page.goto(next);
  return await parseNumbersPage(page, target, phones);
};

const numberIsOnline = async (page: Page, country: Country, phoneNumber: string) => {
  consola.info(`numberIsOnline, country: ${country}, phoneNumber: ${phoneNumber}`);
  const url = getCountryUrl(country);
  consola.success(`got country url ${url}`);
  await page.goto(url);
  const [found] = await parseNumbersPage(page, phoneNumber);

  const phoneMatch = found?.phone && found.phone === (country === 'USA' ? phoneNumber.replace('+1', '') : phoneNumber);

  if (!found.url || !phoneMatch) {
    return false;
  }

  consola.success(`found url ${found.url}`);
  await page.goto(found.url);

  await page.waitForSelector('h1.title');

  const status = await page.$eval(`table.messagesTable`, (table) => !!table);

  return status;
};

const parseMessages = async (page: Page) => {
  const rowLocator = 'table.messagesTable tr';

  const messageRows = (await page.$$eval(rowLocator, (rows) => rows.map((row) => row.textContent))) as string[];

  const unparsedRows = messageRows.map((row) => row.split('\n').filter((x) => x?.trim()));

  return unparsedRows
    .map((row) => {
      const [, ago, ...messages] = row.map((td) => td?.trim());
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
  await page.waitForNetworkIdle({ idleTime: 500 });

  const parsed = (await parseMessages(page)) || [];
  console.log(parsed);
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
  const isAlive = await numberIsOnline(page, options.country, options.phoneNumber);

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
