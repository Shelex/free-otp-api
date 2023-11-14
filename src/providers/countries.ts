import {
  countries as receiveSmsFreeCountries,
  Countries as ReceiveSmsFreeCounties
} from '../providers/receive-sms-free.cc/countries.js';
import {
  countries as anonymSmsCountries,
  Countries as AnonymSmsCountries
} from '../providers/anonymsms.com/countries.js';
import { countries as quackrIoCountries, Countries as QuackrIoCountries } from '../providers/quackr.io/countries.js';
import {
  countries as smsToMeComCountries,
  Countries as SmsToMeComCountries
} from '../providers/smstome.com/countries.js';

export type Country =
  | keyof typeof ReceiveSmsFreeCounties
  | keyof typeof AnonymSmsCountries
  | keyof typeof QuackrIoCountries
  | keyof typeof SmsToMeComCountries;

export const allowedCountries = Array.from(
  new Set([...receiveSmsFreeCountries, ...anonymSmsCountries, ...quackrIoCountries, ...smsToMeComCountries])
);
