import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { Country, PhoneNumber, PhoneNumberListReply, Provider } from '../providers/index.js';
import { delay } from '../time/utils.js';

export const getPhonesListTask = async (country: Country, provider: Provider, attempt = 1): Promise<PhoneNumber[]> => {
  try {
    if (!provider.countries.includes(country)) {
      return [];
    }

    if (!browser.cluster) {
      await browser.createCluster();
    }

    const getPhonesList = async (phones: PhoneNumber[] = [], url?: string): Promise<PhoneNumber[]> => {
      if (!browser.cluster) {
        await browser.createCluster();
      }

      const payload = { country, url };

      const result = (await browser.cluster?.execute(payload, async ({ page, data }) => {
        browser.registerPageHandlers(page);
        return await provider.getPhonesList(page, data.country as Country, data.url as string);
      })) as PhoneNumberListReply;

      const allResults = [...phones, ...result.phones];

      if (result.nextPageUrl) {
        await delay(1.5);
        return await getPhonesList(allResults, result.nextPageUrl);
      }

      return allResults;
    };

    const result = await getPhonesList();

    return result ?? [];
  } catch (e) {
    consola.warn(`failed to fetch phones for ${provider.name} in ${country.toString()}, will retry`);

    if (attempt >= 5) {
      return [];
    }

    await delay(10);
    consola.warn(e);
    return await getPhonesListTask(country, provider, attempt + 1);
  }
};
