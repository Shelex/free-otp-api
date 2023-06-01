import { Page } from 'puppeteer';
import { consola } from 'consola';
import { tryParseOtpCode } from '../parseOtp.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { countries } from './countries.js';

const baseUrl = 'https://receive-sms-free.cc';
const recheckDelay = 5; // seconds

export const getCountryUrl = (country: string) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported`);
  }

  return `${baseUrl}/Free-${country}-Phone-Number/`;
};

export const getPhoneNumberUrl = (country: string, phone: string) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported`);
  }

  return `${getCountryUrl(country)}${phone.replace('+', '')}/`;
};

const numberIsOnline = async (page: Page, country: string, phoneNumber: string) => {
  const url = getPhoneNumberUrl(country, phoneNumber);

  await page.goto(url);

  const locator = `h1[data-clipboard-text="${phoneNumber}"]`;

  const is404 = await page.$eval('body > center > h1', () => true).catch(() => false);
  const isSnowy404 = await page.$eval('canvas#snow', () => true).catch(() => false);

  if (is404 || isSnowy404) {
    return '404';
  }

  await page.waitForSelector(locator);

  const title = await page.$eval(`${locator} img`, (img) => img.title);

  return title === 'Number Online';
};

interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp?: string;
}

const parseMessages = async (page: Page) => {
  const currentUrl = page.url();

  const rowLocator = currentUrl.includes(baseUrl) ? 'div.casetext div.row' : 'div#msgtbl div.row';

  const messageRows = (await page.$$eval(rowLocator, (rows) => rows.map((row) => row.textContent))) as string[];

  const unparsedRows = messageRows.map((row) => row.split('\n').filter((x) => x));

  const findAgoLine = (row: string[]) => row.findIndex((el) => el.includes('ago'));

  return unparsedRows
    .filter((row) => findAgoLine(row) !== -1)
    .map((row) => {
      row.reverse(); // to get last 2 elements (ago and message) at first
      const agoIndex = findAgoLine(row);
      const remainingFields = row.slice(0, agoIndex).reverse().join(' ');
      const ago = row[agoIndex];
      const agoParsed = parseTimeAgo(ago);

      return {
        ago: agoParsed,
        agoText: ago,
        message: remainingFields
      } as Message;
    });
};

export const recursivelyCheckMessages = async (page: Page, askedAt: number, matcher: string): Promise<Message> => {
  await page.waitForNetworkIdle({ idleTime: 500 });

  const parsed = (await parseMessages(page)) || [];

  const match = parsed.find((parsed) => parsed?.ago >= askedAt && parsed?.message?.includes(matcher));

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
  return recursivelyCheckMessages(page, askedAt, matcher);
};

export const handleReceiveSmsFreeCC = async (
  page: Page,
  country: string,
  phoneNumber: string,
  askedOtpAt: number,
  matcher: string
) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);
  const isAlive = await numberIsOnline(page, country, phoneNumber);
  if (!isAlive) {
    throw new Error('number is offline');
  }
  if (isAlive === '404') {
    throw new Error('number returned 404');
  }

  consola.success(`number ${phoneNumber} is online`);

  const match = await recursivelyCheckMessages(page, askedOtpAt, matcher);

  match && consola.success(`found otp message ${match.agoText}: "${match.message}"`);

  return match;
};

export const getPhoneNumbers = async (page: Page, country: string) => {
  consola.start(`starting parsing numbers for ${country}`);
  const url = getCountryUrl(country);

  consola.success(`got url ${url}`);

  await page.goto(url);

  const numbers = await parseNumbersPage(page);

  return numbers;
};

const parseNumbersPage = async (page: Page, phones: string[] = []): Promise<string[]> => {
  consola.start(`parsing page...`);
  await page.waitForSelector('.section04 .index-title', { timeout: 5000 });
  consola.success(`can see pagination element`);
  const phoneNumberElementsLocator = 'li a[href] > h2 > span';
  const currentPagePhones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => el?.textContent)
  );

  const currentPhones = currentPagePhones
    .filter((phone) => Boolean(phone))
    .map((phone) => (phone as string).replace('+1 ', ''));

  phones.push(...currentPhones);

  const nextPage = await page.$('.pagination > li.active + li');

  if (nextPage) {
    consola.info(`can see next page, visiting...`);
    await nextPage.click();
    return await parseNumbersPage(page, phones);
  }

  return phones;
};
