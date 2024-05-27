import fp from 'fastify-plugin';
import health from 'fastify-healthcheck';
import { type FastifyPluginAsync } from 'fastify';

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(health);
};

export default fp(corsPlugin);
