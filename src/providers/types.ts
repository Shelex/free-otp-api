import { Page } from 'puppeteer';
import { Country } from './countries.js';

export enum Source {
  ReceiveSmsFree = 'receive-sms-free.cc',
  AnonymSms = 'anonymsms.com',
  QuackrIo = 'quackr.io',
  SmsToMeCom = 'smstome.com'
}

export interface Provider {
  getPhonesList: (page: Page, country: Country) => Promise<PhoneNumber[]>;
  handleOtp: (page: Page, options: OtpRouteHandlerOptions) => Promise<Message | undefined>;
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

export interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp?: string;
  url: string;
}