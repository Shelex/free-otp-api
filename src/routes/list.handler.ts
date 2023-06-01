import { type RouteHandler } from 'fastify';
import { type ListParams, type ReplyList, type ReplyListError } from './list.schema.js';
import { getPhoneNumbers } from '../providers/receive-sms-free-cc/handler.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';

export const listPhonesHandler: RouteHandler<{
  Params: ListParams;
  Reply: ReplyList | ReplyListError;
}> = async function (req, reply) {
  const { params } = req;

  await browser.createCluster();

  try {
    const result = await browser.cluster?.execute(params.country, async ({ page, data }) => {
      req.raw.on('aborted', async () => {
        consola.info(`request aborted`);
        // just close the page when request canceled
        await page.close();
      });
      return await getPhoneNumbers(page, data);
    });
    reply.send({
      phones: result
    });
  } catch (error) {
    consola.error(error);
    reply.code(400).send({ error: (error as Error)?.message });
  }
};
