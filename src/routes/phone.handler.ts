import { type RouteHandler } from 'fastify';
import { type Params, type Querystring, type Reply, type ReplyError } from './phone.schema.js';
import { parseTimeAgo } from '../time/utils.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { Source, Sources } from '../providers/index.js';

export const getOtpCodeHandler: RouteHandler<{
  Querystring: Querystring;
  Params: Params;
  Reply: Reply | ReplyError;
}> = async function (req, reply) {
  const { params, query } = req;
  const provider = Sources[query?.source ?? Source.ReceiveSmsFree];

  const requested = {
    country: params.country,
    phoneNumber: params.phoneNumber,
    ago: query?.since || parseTimeAgo(query.ago || '30s'),
    agoText: query?.ago,
    match: decodeURIComponent(query?.match || '')
  };

  consola.info(`requested: ${JSON.stringify(requested, null, 2)}`);

  try {
    await browser.createCluster();
    const result = await browser.cluster?.execute(requested, async ({ page, data }) => {
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
      return await provider.handleOtp(page, {
        country: data.country,
        phoneNumber: `+${data.phoneNumber}`,
        matcher: data.match,
        askedOtpAt: data.ago
      });
    });
    reply.send({
      requested,
      result: Array.isArray(result) ? result.at(0) : result,
      results: result.length > 1 ? result : []
    });
  } catch (error) {
    consola.warn(error);
    reply.code(400).send({ requested, error: (error as Error)?.message });
  }
};
