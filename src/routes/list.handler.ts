import { type RouteHandler } from 'fastify';
import { type ListParams, type ReplyList, type ReplyListError } from './list.schema.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { Country, PhoneNumber, PhoneNumberListReply, Source, providers } from '../providers/index.js';
import { getPhones, savePhones } from '../repository/redis.js';
import { filterUniquePhones } from '../providers/helpers.js';

export const listPhonesHandler: RouteHandler<{
  Params: ListParams;
  Reply: ReplyList | ReplyListError;
}> = async function (req, reply) {
  const { params } = req;

  try {
    const queries = providers.map(async (provider) => {
      try {
        if (!provider.countries.includes(params.country)) {
          return [];
        }

        const alreadyStored = (await getPhones(provider.name, params.country)) as PhoneNumber[];
        if (alreadyStored?.length) {
          consola.success(`found ${alreadyStored.length} phones for ${provider.name} in ${params.country} in cache`);
        }

        if (!alreadyStored.length && !browser.cluster) {
          await browser.createCluster();
        }

        const getPhonesList = async (phones: PhoneNumber[] = [], url?: string): Promise<PhoneNumber[]> => {
          if (!browser.cluster) {
            await browser.createCluster();
          }

          const payload = {
            country: params.country,
            url
          };

          const result = (await browser.cluster?.execute(payload, async ({ page, data }) => {
            browser.registerPageHandlers(page);
            req.raw.on('close', async () => {
              if (req.raw.destroyed && !page?.isClosed()) {
                await page?.close();
              }
            });
            req.raw.on('aborted', async () => {
              consola.info(`request aborted`);
              // just close the page when request canceled
              !page?.isClosed() && (await page.close());
            });
            return await provider.getPhonesList(page, data.country as Country, data.url as string);
          })) as PhoneNumberListReply;

          const allPhones = [...phones, ...result.phones];

          if (result.nextPageUrl) {
            return await getPhonesList(allPhones, result.nextPageUrl);
          }

          return filterUniquePhones(allPhones);
        };

        const result = alreadyStored.length ? alreadyStored : await getPhonesList();

        if (!alreadyStored.length && result?.length) {
          await savePhones(provider.name, params.country, result);
        }

        return (
          result?.map((r) => ({
            value: r.phone.replace(' ', '').trim(),
            url: r.url,
            source: provider.name as Source
          })) ?? []
        );
      } catch (e) {
        consola.warn(e);
        return [];
      }
    });

    const result = (await Promise.all(queries)).flat();

    reply.send({
      phones: result
    });
  } catch (error) {
    consola.warn(error);
    reply.code(400).send({ error: (error as Error)?.message });
  }
};
