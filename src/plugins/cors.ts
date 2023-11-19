import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';

const corsPlugin: FastifyPluginAsync = async (app) => {
  const options = {
    origin: ['http://localhost:3000', 'https://otp.shelex.dev']
  };

  await app.register(cors, options);
};

export default fp(corsPlugin);
