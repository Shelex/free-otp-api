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
    match: Array.isArray(typedQuery.match)
      ? typedQuery.match?.map((m) => decodeURIComponent(m))
      : [decodeURIComponent(typedQuery.match || '')],
    ago: Date.now()
  };

  consola.info(`requested: ${JSON.stringify(requested, null, 2)}`);

  await browser.createCluster();

  const messages = [] as string[];

  return await ongoing(connection, req, requested, messages);
};

const ongoing = async (
  connection: SocketStream,
  req: FastifyRequest,
  requested: any,
  messages: string[]
): Promise<any> => {
  try {
    if (connection.socket.readyState !== connection.socket.OPEN) {
      console.log(`connection closed`);
      return;
    }
    const result = await pingPage(connection, requested);

    const newMessages = result.map((record) => record.message).filter((message) => !messages.includes(message)) || [];
    if (newMessages.length) {
      messages.push(...newMessages);
      for (const newMessage of newMessages) {
        connection.socket.send(newMessage);
      }
    }
    await delay(5);

    return (
      connection.socket.readyState === connection.socket.OPEN && (await ongoing(connection, req, requested, messages))
    );
  } catch (error) {
    const message = (error as Error).message;
    if (!messages.includes(message)) {
      messages.push(message);
      connection.socket.send(message);
    }
  }
};

const pingPage = async (connection: SocketStream, requested: any) =>
  (await browser.cluster?.execute(requested, async ({ page, data }) => {
    connection.socket.on('close', async () => {
      console.log(`closing page due to close event from socket`);
      await page.close();
    });
    connection.socket.on('error', async () => {
      console.log(`closing page due to error`);
      await page.close();
    });
    return await handleReceiveSmsFreeCC(page, {
      country: data.country,
      phoneNumber: `+${data.phoneNumber}`,
      matcher: data.match,
      isStreaming: true,
      interval: 5,
      askedOtpAt: data.ago
    });
  })) as Message[];
