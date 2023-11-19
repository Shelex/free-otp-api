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

  try {
    await browser.createCluster();
    const result = await browser.cluster?.execute(body, async ({ page, data }) => {
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
      return await getAuthZeroAccessToken(page, data);
    });
    reply.send(result);
  } catch (error) {
    const err = error as Error;
    consola.warn(error);
    reply.code(400).send({
      error: err.name,
      message: err.message
    });
  }
};
