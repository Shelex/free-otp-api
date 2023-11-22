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
  countries as receiveSmsFreeCountries,
  Countries as ReceiveSmsFreeCounties
} from './receive-sms-free.cc/countries.js';
import { countries as anonymSmsCountries, Countries as AnonymSmsCountries } from './anonymsms.com/countries.js';
import { countries as quackrIoCountries, Countries as QuackrIoCountries } from './quackr.io/countries.js';
import { countries as smsToMeComCountries, Countries as SmsToMeComCountries } from './smstome.com/countries.js';
import { Provider, Source } from './types.js';

export type Country =
  | keyof typeof ReceiveSmsFreeCounties
  | keyof typeof AnonymSmsCountries
  | keyof typeof QuackrIoCountries
  | keyof typeof SmsToMeComCountries;

export const allowedCountries = Array.from(
  new Set([...receiveSmsFreeCountries, ...anonymSmsCountries, ...quackrIoCountries, ...smsToMeComCountries])
);

export const Sources: Record<Source, Provider> = {
  [Source.ReceiveSmsFree]: {
    name: Source.ReceiveSmsFree,
    getPhonesList: getReceiveSmsFreePhones,
    handleOtp: handleReceiveSmsFreeCC,
    countries: receiveSmsFreeCountries,
    getCountryUrl: getReceiveSmsFreeCountryUrl
  },
  [Source.AnonymSms]: {
    name: Source.AnonymSms,
    getPhonesList: getAnonymSmsPhones,
    handleOtp: handleAnonymSms,
    countries: anonymSmsCountries,
    getCountryUrl: getAnonymSmsCountryUrl
  },
  [Source.QuackrIo]: {
    name: Source.QuackrIo,
    getPhonesList: getQuackrIoPhones,
    handleOtp: handleQuackrIo,
    countries: quackrIoCountries,
    getCountryUrl: getQuackrIoCountryUrl
  },
  [Source.SmsToMeCom]: {
    name: Source.SmsToMeCom,
    getPhonesList: getSmsToMeComPhones,
    handleOtp: handleSmsToMe,
    countries: smsToMeComCountries,
    getCountryUrl: getSmsToMeCountryUrl
  }
};

export const providers = (Object.keys(Sources) as Source[]).map((source) => Sources[source]);
