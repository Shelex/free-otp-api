export const delay = (seconds: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};

export const waitFor = async (condition: () => boolean) => {
  while (!condition()) {
    await delay(1);
  }
  return condition();
};

type TimeUnit = 's' | 'm' | 'h' | 'd';

export const parseTimeAgo = (timeAgo: string): number => {
  const relativeTimeString = !timeAgo.includes('ago') ? `${timeAgo} ago` : timeAgo;

  const timeUnits: Record<TimeUnit, number> = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24
  };

  const timeRegex = /.*?(\d+)\s?([smhd]).*?ago/i;
  const match = relativeTimeString.match(timeRegex);

  if (!match) {
    return 0;
  }

  const [, valueString, unitString] = match;

  if (!valueString || !unitString) {
    return 0;
  }

  const value = parseInt(valueString, 10);

  const unit = unitString.toLowerCase() as TimeUnit;

  const now = Date.now();
  const diff = value * timeUnits[unit];
  const timestamp = now - diff;

  return timestamp;
};

export const stringifyTriggerOtpTimeDiff = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const units = {
    second: seconds % 60,
    minute: minutes % 60,
    hour: hours
  };

  const unitNames = Object.keys(units) as (keyof typeof units)[];

  const message = unitNames
    .filter((name) => units[name] > 0)
    .map((unitName) => `${units[unitName]}${unitName.at(0)}`)
    .reverse()
    .join(' ');

  return message;
};
