import { type RouteHandler } from 'fastify';
import { type ReplyCountries, type ReplyCountriesError } from './countries.schema.js';
import { consola } from 'consola';
import { PhoneNumber, providers } from '../providers/index.js';
import { getPhones } from '../repository/redis.js';

const getAvailableCountries = () =>
  Promise.all(
    providers.flatMap(
      async (provider) =>
        await Promise.all(
          provider.countries.map(async (country) => {
            const phones = (await getPhones(provider.name, country)) as PhoneNumber[];
            return {
              country: country,
              source: provider.name,
              url: provider?.getCountryUrl ? provider.getCountryUrl(country) : provider.baseUrl,
              count: phones.length ?? 0
            };
          })
        )
    )
  );

export const listCountriesHandler: RouteHandler<{
  Reply: ReplyCountries | ReplyCountriesError;
}> = async function (req, reply) {
  try {
    const providerRecords = await getAvailableCountries();
    const countries = providerRecords.flat();
    return reply.send(countries);
  } catch (error) {
    consola.warn(error);
    return reply.code(400).send({ error: (error as Error)?.message });
  }
};
