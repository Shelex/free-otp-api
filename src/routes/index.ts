import { type FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { getOtpCodeSchema, replyError, replySchema } from './phone.schema.js';
import { getOtpCodeHandler } from './phone.handler.js';

export const routes = async (app: FastifyInstance) => {
  app.addSchema(replySchema);
  app.addSchema(replyError);
  app.route({
    method: 'GET',
    url: '/:country/:phoneNumber',
    schema: getOtpCodeSchema,
    handler: getOtpCodeHandler
  });
};

export default fp(routes);
