import { FastifyRequest } from 'fastify';
import { SocketStream, WebsocketHandler } from '@fastify/websocket';
import { type Params, type Querystring } from './phoneListener.schema.js';
import { Message, handleReceiveSmsFreeCC } from '../providers/receive-sms-free-cc/handler.js';
import { browser } from '../browser/cluster.js';
import { consola } from 'consola';
import { delay } from '../time/utils.js';

export const getOtpCodeListenerHandler: WebsocketHandler = async function (
  connection: SocketStream,
  req: FastifyRequest
) {
  const { params, query } = req;
  const typedParams = params as Params;
  const typedQuery = query as Querystring;

  const requested = {
    country: typedParams.country,
    phoneNumber: typedParams.phoneNumber,
    match: Array.isArray(typedQuery.match) ? typedQuery.match?.map((m) => decodeURIComponent(m)) : [typedQuery.match],
    ago: Date.now()
  };

  consola.info(`requested: ${JSON.stringify(requested, null, 2)}`);

  await browser.createCluster();

  const messages = [] as string[];

  connection.socket.on('error', async () => {
    connection.socket.close();
  });

  await ongoing(connection, req, requested, messages);
};

const ongoing = async (connection: any, req: any, requested: any, messages: string[]): Promise<any> => {
  try {
    const result = (await browser.cluster?.execute(requested, async ({ page, data }) => {
      connection.socket.on('close', async () => {
        await page.close();
      });

      return await handleReceiveSmsFreeCC(page, {
        country: data.country,
        phoneNumber: `+${data.phoneNumber}`,
        matcher: data.match,
        isStreaming: true,
        interval: 10,
        askedOtpAt: data.ago
      });
    })) as Message[];

    const newMessages = result.map((record) => record.message).filter((message) => !messages.includes(message)) || [];
    if (newMessages.length) {
      messages.push(...newMessages);
      for (const newMessage of newMessages) {
        connection.socket.send(newMessage);
      }
    }
    await delay(5);

    return await ongoing(connection, req, requested, messages);
  } catch (error) {
    const message = (error as Error).message;
    if (!messages.includes(message)) {
      messages.push(message);
      connection.socket.send(message);
    }
    return await ongoing(connection, req, requested, messages);
  }
};
