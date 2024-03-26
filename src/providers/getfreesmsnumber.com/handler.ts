import { Page } from 'puppeteer';
import { consola } from 'consola';
import { Countries, countries } from './countries.js';
import type { Message, OtpRouteHandlerOptions, PhoneNumberListReply } from '../types.js';
import { delay, parseTimeAgo, stringifyTriggerOtpTimeDiff } from '../../time/utils.js';
import { tryParseOtpCode } from '../helpers.js';
import { defaultRecheckDelay } from '../constants.js';
import { Country } from '../providers.js';

const baseUrl = 'https://getfreesmsnumber.com/';

export const getCountryUrl = (country: Country) => {
  if (!countries.includes(country)) {
    return '';
  }

  return `${baseUrl}/virtual-phone/${Countries[country as keyof typeof Countries]}`;
};

const getPhoneNumberUrl = (phone: string) => {
  return `${baseUrl}/virtual-phone/p-${phone.replace('+', '')}`;
};

export const getFreeSmsNumberPhones = async (page: Page, country: Country, nextUrl?: string) => {
  consola.start(`starting parsing numbers for ${country.toString()}`);
  const url = nextUrl ?? getCountryUrl(country);

  consola.success(`got url ${url}`);

  if (!url) {
    return { phones: [] };
  }

  return await parseNumbersPage(url, page);
};

const elementExist = async (page: Page, locator: string) => {
  return (await page.$(locator).catch(() => null)) !== null;
};

const parseNumbersPage = async (url: string, page: Page, target?: string): Promise<PhoneNumberListReply> => {
  await page.goto(url);
  consola.start(`parsing page ${page.url()}...`);
  await page.waitForSelector('.container .row .card:nth-child(1)', { timeout: 5000 });
  const phoneNumberElementsLocator = '.card .card-text a';
  const phones = await page.$$eval(phoneNumberElementsLocator, (elements) =>
    elements.map((el) => ({
      url: el?.href?.trim(),
      phone: el?.href?.trim()?.split('/')?.at(4)?.replace('p-', '') ?? ''
    }))
  );

  if (target) {
    const phone = phones.find((phone) => phone.url.includes(target.replace('+', '')));
    if (phone?.url) {
      consola.info(`returning phone ${phone?.phone} with url ${phone?.url}`);
      await page.goto(phone.url);
      await page.waitForSelector('.alert');
      return { phones: [phone] };
    }
  }

  const paginationLocator = 'ul.pagination a';
  const hasPagination = await elementExist(page, paginationLocator);

  if (!hasPagination) {
    return { phones };
  }

  const activePageLocator = 'ul.pagination li.active';
  const activePageText = await page.$eval(activePageLocator, (el) => el?.textContent?.trim());
  if (!activePageText) {
    return { phones };
  }

  const links = await page.$$eval(paginationLocator, (elements) => elements.map((a) => a.href));

  const next = links.find((link) => link.endsWith(`page=${parseInt(activePageText ?? '0') + 1}`));
  if (!next || next === page.url()) {
    return { phones };
  }

  return { phones, nextPageUrl: next };
};

const numberIsOnline = async (
  page: Page,
  country: Country,
  phoneNumber: string,
  pageUrl?: string
): Promise<{ online: boolean; nextPageUrl?: string }> => {
  consola.info(`numberIsOnline, country: ${country.toString()}, phoneNumber: ${phoneNumber}`);
  const url = pageUrl ?? getPhoneNumberUrl(phoneNumber);
  consola.success(`got phone url ${url}`);

  if (!url) {
    return { online: false };
  }

  try {
    const opened = await page.goto(url);
    return { online: !!opened };
  } catch (e) {
    return { online: false };
  }
};

const parseMessages = async (page: Page) => {
  const cardLocator = '.container .row .card';

  const cards = await page.$$eval(cardLocator, (cards) =>
    cards.map((card) => ({
      sender: card.querySelector('.card-header a')?.textContent?.trim(),
      body: card.querySelector('.card-body')?.textContent?.trim()
    }))
  );

  const delimiter = '\n                                                        \n';

  return cards
    .map((card) => {
      const { sender, body } = card;
      const [message, agoText] = body?.split(delimiter) ?? [];

      const agoParsed = parseTimeAgo(agoText?.trim());

      return {
        ago: agoParsed,
        agoText: agoText?.trim(),
        message: `${sender} : ${message?.trim() ?? ''}`
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
  await page.waitForNetworkIdle({ idleTime: 2500 });

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

  const buttons = await page.$$('.container .row p a');

  await buttons.at(0)?.click();

  await delay(recheckDelay);
  return recursivelyCheckMessages(page, askedAt, matcher, recheckDelay);
};

export const handleGetFreeSmsNumberCom = async (page: Page, options: OtpRouteHandlerOptions) => {
  consola.start(`starting automated check for otp`);
  consola.start(`checking number is online at ${baseUrl}`);

  const lookupStatus = async (url?: string): Promise<boolean> => {
    const { online, nextPageUrl } = await numberIsOnline(page, options.country, options.phoneNumber, url);
    if (!online && nextPageUrl) {
      return await lookupStatus(nextPageUrl);
    }
    return online;
  };

  const isAlive = await lookupStatus();

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
