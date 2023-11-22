import { Cron } from 'croner';
import { Country, Provider, providers } from '../providers/index.js';
import { getPhonesListTask } from '../providers/getPhonesListTask.js';
import { consola } from 'consola';
import { savePhones } from '../repository/redis.js';

const cacheCountryPhones = async (provider: Provider, country: Country) => {
  try {
    return await getPhonesListTask(country, provider);
  } catch (error) {
    consola.warn(error);
    return [];
  }
};

const lookupPhoneNumbers = async () => {
  consola.info(`starting PhoneNumbers lookup`);
  for (const provider of providers) {
    consola.info(`checking countries for ${provider.name}`);
    for (const country of provider.countries) {
      consola.info(`checking country ${country} for ${provider.name}`);
      const phones = await cacheCountryPhones(provider, country);
      await savePhones(provider.name, country, phones ?? []);
    }
  }
};

//At minute 30 past every 10th hour
export const cachePhoneNumbersJob = Cron('30 */10 * * *', { catch: true, unref: true, paused: true }, async () => {
  consola.success(`starting job`);
  await lookupPhoneNumbers();
});

consola.info(`[cache-job] next 10 runs: ${JSON.stringify(cachePhoneNumbersJob.nextRuns(10), null, 2)}`);
