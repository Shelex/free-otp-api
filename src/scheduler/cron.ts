import { Cron } from 'croner';
import { Country, Provider, providers } from '../providers/index.js';
import { getPhonesListTask } from '../providers/getPhonesListTask.js';
import { consola } from 'consola';
import { savePhones } from '../repository/redis.js';
import { filterUniquePhones } from '../providers/helpers.js';

const cacheCountryPhones = async (provider: Provider, country: Country) => {
  try {
    return await getPhonesListTask(country, provider);
  } catch (error) {
    consola.warn(error);
    return [];
  }
};

const lookupPhoneNumbers = async (provider: Provider) => {
  consola.info(`checking countries for ${provider.name}`);
  for (const country of provider.countries) {
    consola.info(`checking country ${country.toString()} for ${provider.name}`);
    const phones = await cacheCountryPhones(provider, country);
    await savePhones(provider.name, country.toString(), filterUniquePhones(phones) ?? []);
  }
};

export const createJob = (provider: Provider, scheduleExpression: string) =>
  new Cron(scheduleExpression, { catch: true, unref: true, paused: true }, async () => {
    consola.success(`starting job`);
    await lookupPhoneNumbers(provider);
  });

export const jobs = providers.reduce((jobs, provider) => {
  const job = createJob(provider, provider.refreshCacheExpression ?? '30 */8 * * *');
  jobs[provider.name] = job;
  consola.info(`[cache-job] created for ${provider.name}, next runs: ${JSON.stringify(job.nextRuns(10), null, 2)}`);
  return jobs;
}, {} as Record<Provider['name'], Cron>);
