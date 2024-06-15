import { Page } from 'puppeteer';
import { Country } from './index.js';

export enum Source {
  ReceiveSmsFree = 'receive-sms-free.cc',
  AnonymSms = 'anonymsms.com',
  QuackrIo = 'quackr.io',
  SmsToMeCom = 'smstome.com',
  ReceiveSmsOnlineCom = 'receivesmsonline.com',
  ReceiveSmsCo = 'receivesms.co',
  ReceiveSmssOnlineCom = 'receive-smss-online.com'
}

export interface Provider {
  baseUrl: string;
  name: string;
  getPhonesList: (page: Page, country: Country, url?: string) => Promise<PhoneNumberListReply>;
  handleOtp: (page: Page, options: OtpRouteHandlerOptions) => Promise<Message | Message[] | undefined>;
  countries: Country[];
  getCountryUrl?: (country: Country) => string;
  refreshCacheExpression?: string;
}

export interface OtpRouteHandlerOptions {
  country: Country;
  phoneNumber: string;
  askedOtpAt?: number;
  matcher: string | string[];
  interval?: number;
}

export interface PhoneNumber {
  phone: string;
  url: string;
}

export interface PhoneNumberListReply {
  phones: PhoneNumber[];
  nextPageUrl?: string;
}

export interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp?: string;
  url: string;
  error?: string;
}
