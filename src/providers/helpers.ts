import { PhoneNumber } from './index.js';

const otpPattern = new RegExp(/(\d){4,8}/);

export const tryParseOtpCode = (line: string) => {
  const match = line.match(otpPattern);
  if (!match?.at(0)) {
    return;
  }

  return match.at(0);
};

export const filterUniquePhones = (phones: PhoneNumber[]) =>
  phones.filter((obj, index, self) => index === self.findIndex((t) => t.phone === obj.phone));
