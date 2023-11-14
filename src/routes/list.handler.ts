import { type RouteHandler } from 'fastify';
import { type ListParams, type ReplyList, type ReplyListError } from './list.schema.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { PhoneNumber, providers } from '../providers/index.js';

export const listPhonesHandler: RouteHandler<{
  Params: ListParams;
  Reply: ReplyList | ReplyListError;
}> = async function (req, reply) {
  const { params } = req;

  try {
    await browser.createCluster();
    const queries = providers.map(async (provider) => {
      try {
        const result = (await browser.cluster?.execute(params.country, async ({ page, data }) => {
          req.raw.on('aborted', async () => {
            consola.info(`request aborted`);
            // just close the page when request canceled
            await page.close();
          });
          return await provider.getPhonesList(page, data);
        })) as PhoneNumber[];

        return (
          result?.map((r) => ({
            value: r.phone.replace(' ', '').trim(),
            url: r.url,
            source: provider.name
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
