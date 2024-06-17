import { Page } from 'puppeteer';
import { consola } from 'consola';
import { tryParseOtpCode } from '../helpers.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { Countries } from './countries.js';
import { Source, type OtpRouteHandlerOptions, type PhoneNumberListReply } from '../types.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';
import { getPhones } from '../../repository/redis.js';

const baseUrl = 'https://www.receive-smss-online.com/';

export interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp?: string;
  url: string;
}

const parseMessages = async (page: Page) => {
  const currentUrl = page.url();
  const rowLocator = 'tr';

  const messageRows = await page.$$eval(rowLocator, (rows) =>
    rows.map((row) => ({
      message: row.children[1]?.textContent?.trim() ?? '',
      from: row.children[0]?.textContent?.trim() ?? '',
      ago: row.children[2]?.textContent?.trim() ?? ''
    }))
  );

  return messageRows
    .filter((row) => row.ago.length && row.message.length)
    .map((row) => {
      const agoParsed = parseTimeAgo(row.ago);

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
  await page.waitForNetworkIdle({ idleTime: 1500 });

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

const getPhoneUrl = async (phone: string, country: Country) => {
  const phones = await getPhones(Source.ReceiveSmssOnlineCom, country);
  return phones.find((p) => p.phone === phone.replace(country === 'USA' ? '+1' : '+', ''))?.url;
};

export const handleReceiveSmssOnlineCom = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);

  const url = await getPhoneUrl(options.phoneNumber, options.country);

  consola.info(`found phone url: ${url}`);

  if (!url) {
    return;
  }

  await page.goto(url);
  await delay(defaultRecheckDelay);

  const match = await recursivelyCheckMessages(
    page,
    options.askedOtpAt || 0,
    options.matcher,
    options?.interval || defaultRecheckDelay
  );

  return match;
};

export const getReceiveSmssOnlineComPhones = async (page: Page, country: Country): Promise<PhoneNumberListReply> => {
  consola.start(`starting parsing numbers for ${country.toString()}`);

  const { phones, nextPageUrl } = await parseNumbersPage(baseUrl, page, country);

  return {
    phones,
    nextPageUrl
  };
};

const parseNumbersPage = async (url: string, page: Page, country: Country): Promise<PhoneNumberListReply> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('h2', { timeout: 5000 });
  const numberGridLocator = 'div.container:has(h2) > div:nth-child(3)';
  await page.waitForSelector(numberGridLocator, { timeout: 5000 });
  await delay(1);

  const targetCountry = Countries[country as keyof typeof Countries];

  const phones = await page.$$eval(
    `${numberGridLocator} div`,
    (cards, baseUrl, country) =>
      cards
        .filter((card) =>
          card?.querySelector('div span.font-medium.text-white')?.textContent?.trim()?.includes(country)
        )
        .map((card) => {
          const phoneNumber = card?.querySelector('.font-medium.text-sm')?.textContent?.trim() ?? '';
          const formattedPhone = phoneNumber
            .replace(/[\s\(\)]/g, '')
            .replace(country === 'United States' ? '+1' : '+', '');
          const url = card?.querySelector('a')?.getAttribute('href') ?? '';

          return {
            phone: formattedPhone,
            url: `${baseUrl}${url}`.replace(/\/\//g, '/')
          };
        })
        .filter((record) => record.phone.length >= 10 || record.phone.length <= 13),
    baseUrl,
    targetCountry
  );

  return {
    phones
  };
};
