import { type FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { getOtpCodeSchema, replyError, replySchema } from './phone.schema.js';
import { listPhonesSchema, replyListError, replyListSchema } from './list.schema.js';
import { getOtpCodeHandler } from './phone.handler.js';
import { listPhonesHandler } from './list.handler.js';

export const routes = async (app: FastifyInstance) => {
  app.addSchema(replySchema);
  app.addSchema(replyError);
  app.addSchema(replyListSchema);
  app.addSchema(replyListError);
  app.route({
    method: 'GET',
    url: '/:country/:phoneNumber',
    schema: getOtpCodeSchema,
    handler: getOtpCodeHandler
  });
  app.route({
    method: 'GET',
    url: '/list/:country',
    schema: listPhonesSchema,
    handler: listPhonesHandler
  });
};

export default fp(routes);
