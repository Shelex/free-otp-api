import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

const websocketPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyWebsocket);
};

export default fp(websocketPlugin);
