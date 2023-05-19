import Fastify from 'fastify';
import { browser } from './browser/cluster.js';
import { consola } from 'consola';
import { parseTimeAgo } from './time/utils.js';
import { getPhoneNumberUrl, handleReceiveSmsFreeCC } from './providers/receive-sms-free-cc.js';
import { schema } from './schema.js';

const app = Fastify();

(async () => {
  await browser.createCluster();
})();

app.get<{
  Querystring: {
    ago?: string;
    match?: string;
  };
  Params: {
    country: string;
    phoneNumber: string;
  };
}>('/:country/:phoneNumber', { schema }, async (req, reply) => {
  const { params, query } = req;

  const requested = {
    country: params.country,
    phoneNumber: params.phoneNumber,
    ago: parseTimeAgo(query.ago || '30s'),
    agoText: query.ago,
    match: query.match || '',
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
      return await handleReceiveSmsFreeCC(page, data.country, `+${data.phoneNumber}`, data.ago, data.match);
    });
    reply.send({ requested, result });
  } catch (error) {
    consola.info(`in catch`);
    consola.error(error);
    reply.status(400);
    reply.send({ requested, error: (error as Error)?.message });
  }
});

setInterval(async () => {
  await browser.refreshCluster();
  // Close cluster every 10 minutes to avoid leaks
}, 10 * 60 * 1000);

app.listen({ port: parseInt(process.env.PORT || '') || 3030 }, (err) => {
  if (err) throw err;
  // Server is now listening on
});

process.on('SIGINT', async () => {
  consola.info(`Received SIGINT. Closing...`);
  await browser.closeCluster();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  consola.info(`Received SIGTERM. Closing...`);
  await browser.closeCluster();
  process.exit(0);
});

process.on('SIGHUP', async () => {
  consola.info(`Received SIGHUP. Closing...`);
  await browser.closeCluster();
  process.exit(0);
});
