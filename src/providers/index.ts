import { Provider, Source } from './types.js';
import { handleReceiveSmsFreeCC, getReceiveSmsFreePhones } from './receive-sms-free.cc/handler.js';
import { handleAnonymSms, getAnonymSmsPhones } from './anonymsms.com/handler.js';
import { handleQuackrIo, getQuackrIoPhones } from './quackr.io/handler.js';
import { handleSmsToMe, getSmsToMeComPhones } from './smstome.com/handler.js';

export * from './types.js';
export * from './countries.js';
export * from './constants.js';

export const Sources: Record<Source, Provider> = {
  [Source.ReceiveSmsFree]: {
    getPhonesList: getReceiveSmsFreePhones,
    handleOtp: handleReceiveSmsFreeCC
  },
  [Source.AnonymSms]: {
    getPhonesList: getAnonymSmsPhones,
    handleOtp: handleAnonymSms
  },
  [Source.QuackrIo]: {
    getPhonesList: getQuackrIoPhones,
    handleOtp: handleQuackrIo
  },
  [Source.SmsToMeCom]: {
    getPhonesList: getSmsToMeComPhones,
    handleOtp: handleSmsToMe
  }
};

export const providers = (Object.keys(Sources) as Source[]).map((source) => ({
  name: source as Source,
  ...Sources[source]
}));
