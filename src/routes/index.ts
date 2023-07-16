import { type FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { getOtpCodeSchema, replyError, replySchema } from './phone.schema.js';
import { listPhonesSchema, replyListError, replyListSchema } from './list.schema.js';
import { authZeroSchema, replyAuthZeroError, replyAuthZeroSchema } from './auth0.schema.js';
import { getOtpCodeHandler } from './phone.handler.js';
import { listPhonesHandler } from './list.handler.js';
import { authZeroHandler } from './auth0.handler.js';

export const routes = async (app: FastifyInstance) => {
  app.addSchema(replySchema);
  app.addSchema(replyError);
  app.addSchema(replyListSchema);
  app.addSchema(replyListError);
  app.addSchema(replyAuthZeroSchema);
  app.addSchema(replyAuthZeroError);
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
  app.route({
    method: 'POST',
    url: '/auth0',
    schema: authZeroSchema,
    handler: authZeroHandler
  });
};

export default fp(routes);
