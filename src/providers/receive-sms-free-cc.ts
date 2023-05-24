import { Page } from 'puppeteer';
import { consola } from 'consola';
import { tryParseOtpCode } from './parseOtp.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../time/utils.js';

const baseUrl = 'https://receive-sms-free.cc';

export const countries = [
  'France',
  'Netherlands',
  'Finland',
  'Denmark',
  'Sweden',
  'UK',
  'USA',
  'Spain',
  'Canada',
  'Belgium',
  'Mexico',
  'Kazakhstan',
  'Germany',
  'Philippines',
  'Romania',
  'Ukraine',
  'Estonia',
  'Italy',
  'Latvia',
  'CzechRepublic',
  'Ireland',
  'Morocco',
  'Austria',
  'Poland',
  'China',
  'Switzerland',
  'Croatia',
  'Portugal',
  'HongKong',
  'Myanmar',
  'Israel',
  'India',
  'SouthAfrica',
  'Macao',
  'Indonesia',
  'Japan',
  'Korea',
  'Serbia',
  'Nigeria',
  'Australia',
  'Malaysia',
  'Norway',
  'Vietnam',
  'NewZealand',
  'Thailand',
  'Moldova',
  'TimorLeste'
];

export const getPhoneNumberUrl = (country: string, phone: string) => {
  if (!countries.includes(country)) {
    throw new Error(`country ${country} is not supported`);
  }

  return `${baseUrl}/Free-${country}-Phone-Number/${phone.replace('+', '')}/`;
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
  textAgo: string;
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
        textAgo: ago,
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
      parsed.shift()?.textAgo
    }, will try after 5s...`
  );

  const buttons = await page.$$('.btn-primary');

  await buttons.at(0)?.click();

  const currentUrl = page.url();
  if (!currentUrl.includes(baseUrl)) {
    await page.waitForNavigation();
  }

  await delay(3);
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

  consola.success(`number is online`);

  const match = await recursivelyCheckMessages(page, askedOtpAt, matcher);

  match && consola.success(`found otp message ${match.textAgo}: "${match.message}"`);

  return match;
};
