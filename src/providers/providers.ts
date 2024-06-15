import {
  handleReceiveSmsFreeCC,
  getReceiveSmsFreePhones,
  getCountryUrl as getReceiveSmsFreeCountryUrl
} from './receive-sms-free.cc/handler.js';
import {
  handleAnonymSms,
  getAnonymSmsPhones,
  getCountryUrl as getAnonymSmsCountryUrl
} from './anonymsms.com/handler.js';
import { handleQuackrIo, getQuackrIoPhones, getCountryUrl as getQuackrIoCountryUrl } from './quackr.io/handler.js';
import { handleSmsToMe, getSmsToMeComPhones, getCountryUrl as getSmsToMeCountryUrl } from './smstome.com/handler.js';
import {
  handleReceiveSmsCo,
  getReceiveSmsCoPhones,
  getCountryUrl as getReceiveSmsCoCountryUrl
} from './receivesms.co/handler.js';
import {
  countries as receiveSmsFreeCountries,
  Countries as ReceiveSmsFreeCounties
} from './receive-sms-free.cc/countries.js';
import { countries as anonymSmsCountries, Countries as AnonymSmsCountries } from './anonymsms.com/countries.js';
import { countries as quackrIoCountries, Countries as QuackrIoCountries } from './quackr.io/countries.js';
import { countries as smsToMeComCountries, Countries as SmsToMeComCountries } from './smstome.com/countries.js';
import { countries as receiveSmsCoCountries, Countries as ReceiveSmsCoCountries } from './receivesms.co/countries.js';
import {
  handleReceiveSmsOnlineCom,
  getReceiveSmsOnlineComPhones,
  getCountryUrl as getReceiveSmsOnlineCountryUrl
} from './receiveasmsonline.com/handler.js';
import {
  countries as receiveSmsOnlineComCountries,
  Countries as ReceiveSmsOnlineComCountries
} from './receiveasmsonline.com/countries.js';
import { handleReceiveSmssOnlineCom, getReceiveSmssOnlineComPhones } from './receive-smss-online.com/handler.js';
import {
  countries as getReceiveSmssOnlineComCountries,
  Countries as GetReceiveSmssOnlineComCountries
} from './receive-smss-online.com/countries.js';
import { Provider, Source } from './types.js';

export type Country =
  | keyof typeof ReceiveSmsFreeCounties
  | keyof typeof AnonymSmsCountries
  | keyof typeof QuackrIoCountries
  | keyof typeof SmsToMeComCountries
  | keyof typeof ReceiveSmsOnlineComCountries
  | keyof typeof ReceiveSmsCoCountries
  | keyof typeof GetReceiveSmssOnlineComCountries;

export const allowedCountries = Array.from(
  new Set([
    ...receiveSmsFreeCountries,
    ...anonymSmsCountries,
    ...quackrIoCountries,
    ...smsToMeComCountries,
    ...receiveSmsOnlineComCountries,
    ...receiveSmsCoCountries,
    ...getReceiveSmssOnlineComCountries
  ])
);

export const Sources: Record<Source, Provider> = {
  [Source.ReceiveSmsFree]: {
    name: Source.ReceiveSmsFree,
    baseUrl: 'https://receive-sms-free.cc',
    getPhonesList: getReceiveSmsFreePhones,
    handleOtp: handleReceiveSmsFreeCC,
    countries: receiveSmsFreeCountries,
    getCountryUrl: getReceiveSmsFreeCountryUrl,
    refreshCacheExpression: '5 */8 * * *'
  },
  [Source.AnonymSms]: {
    name: Source.AnonymSms,
    baseUrl: 'https://anonymsms.com',
    getPhonesList: getAnonymSmsPhones,
    handleOtp: handleAnonymSms,
    countries: anonymSmsCountries,
    getCountryUrl: getAnonymSmsCountryUrl,
    refreshCacheExpression: '15 */8 * * *'
  },
  [Source.QuackrIo]: {
    name: Source.QuackrIo,
    baseUrl: 'https://quackr.io',
    getPhonesList: getQuackrIoPhones,
    handleOtp: handleQuackrIo,
    countries: quackrIoCountries,
    getCountryUrl: getQuackrIoCountryUrl,
    refreshCacheExpression: '25 */8 * * *'
  },
  [Source.SmsToMeCom]: {
    name: Source.SmsToMeCom,
    baseUrl: 'https://smstome.com',
    getPhonesList: getSmsToMeComPhones,
    handleOtp: handleSmsToMe,
    countries: smsToMeComCountries,
    getCountryUrl: getSmsToMeCountryUrl,
    refreshCacheExpression: '30 */8 * * *'
  },
  [Source.ReceiveSmsCo]: {
    name: Source.ReceiveSmsCo,
    baseUrl: 'https://receivesms.co',
    getPhonesList: getReceiveSmsCoPhones,
    handleOtp: handleReceiveSmsCo,
    countries: receiveSmsCoCountries,
    getCountryUrl: getReceiveSmsCoCountryUrl,
    refreshCacheExpression: '35 */8 * * *'
  },
  [Source.ReceiveSmsOnlineCom]: {
    name: Source.ReceiveSmsOnlineCom,
    baseUrl: 'https://receivesmsonline.com',
    getPhonesList: getReceiveSmsOnlineComPhones,
    handleOtp: handleReceiveSmsOnlineCom,
    countries: receiveSmsOnlineComCountries,
    getCountryUrl: getReceiveSmsOnlineCountryUrl,
    refreshCacheExpression: '40 */8 * * *'
  },
  [Source.ReceiveSmssOnlineCom]: {
    name: Source.ReceiveSmssOnlineCom,
    baseUrl: 'https://receive-smss-online.com',
    getPhonesList: getReceiveSmssOnlineComPhones,
    handleOtp: handleReceiveSmssOnlineCom,
    countries: getReceiveSmssOnlineComCountries,
    getCountryUrl: () => '',
    refreshCacheExpression: '42 */8 * * *'
  }
};

export const providers = (Object.keys(Sources) as Source[]).map((source) => Sources[source]);
