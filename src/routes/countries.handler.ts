import { type RouteHandler } from 'fastify';
import { type ReplyCountries, type ReplyCountriesError } from './countries.schema.js';
import { consola } from 'consola';
import { providers } from '../providers/index.js';

export const listCountriesHandler: RouteHandler<{
  Reply: ReplyCountries | ReplyCountriesError;
}> = async function (req, reply) {
  try {
    const countries = providers.flatMap((provider) =>
      provider.countries.map((name) => ({
        country: name,
        source: provider.name,
        url: provider.getCountryUrl(name)
      }))
    );

    reply.send(countries);
  } catch (error) {
    consola.warn(error);
    reply.code(400).send({ error: (error as Error)?.message });
  }
};
