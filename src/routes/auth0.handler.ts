import { type RouteHandler } from 'fastify';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { type AuthZeroBody, type ReplyAuthZero, type ReplyAuthZeroError } from './auth0.schema.js';
import { getAuthZeroAccessToken } from '../providers/auth0/index.js';

export const authZeroHandler: RouteHandler<{
  Body: AuthZeroBody;
  Reply: ReplyAuthZero | ReplyAuthZeroError;
}> = async function (req, reply) {
  const { body } = req;

  await browser.createCluster();

  if (!browser.cluster) {
    reply.code(500).send({
      error: 'failed to start browser session'
    });
    return;
  }

  try {
    const result = await browser.cluster?.execute(body, async ({ page, data }) => {
      req.raw.on('aborted', async () => {
        consola.info(`request aborted`);
        // just close the page when request canceled
        await page.close();
      });
      return await getAuthZeroAccessToken(page, data);
    });
    reply.send(result);
  } catch (error) {
    const err = error as Error;
    consola.error(err);
    reply.code(400).send({
      error: err.name,
      message: err.message
    });
  }
};
