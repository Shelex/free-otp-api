const otpPattern = new RegExp(/(\d){4,8}/);

export const tryParseOtpCode = (line: string) => {
  const match = line.match(otpPattern);
  if (!match || !match.at(0)) {
    return;
  }

  return match.at(0);
};
