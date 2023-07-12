import { type RouteHandler } from 'fastify';
import { type Params, type Querystring, type Reply, type ReplyError } from './phone.schema.js';
import { getPhoneNumberUrl, handleReceiveSmsFreeCC } from '../providers/receive-sms-free-cc/handler.js';
import { parseTimeAgo } from '../time/utils.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';

export const getOtpCodeHandler: RouteHandler<{
  Querystring: Querystring;
  Params: Params;
  Reply: Reply | ReplyError;
}> = async function (req, reply) {
  const { params, query } = req;

  const requested = {
    country: params.country,
    phoneNumber: params.phoneNumber,
    ago: parseTimeAgo(query.ago || '30s'),
    agoText: query.ago,
    match: decodeURIComponent(query.match || ''),
    url: getPhoneNumberUrl(params.country, params.phoneNumber)
  };

  consola.info(`requested: ${JSON.stringify(requested, null, 2)}`);

  await browser.createCluster();

  try {
    const result = await browser.cluster?.execute(requested, async ({ page, data }) => {
      req.raw.on('aborted', async () => {
        consola.info(`request aborted`);
        // just close the page when request canceled
        await page.close();
      });
      return await handleReceiveSmsFreeCC(page, {
        country: data.country,
        phoneNumber: `+${data.phoneNumber}`,
        matcher: data.match,
        askedOtpAt: data.ago
      });
    });
    reply.send({ requested, result });
  } catch (error) {
    consola.error(error);
    reply.code(400).send({ requested, error: (error as Error)?.message });
  }
};
