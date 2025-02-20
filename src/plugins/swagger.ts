import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import fastifySwagger, { type FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi, { type FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import packageJSON from '../../package.json' assert { type: 'json' };

const docsPlugin: FastifyPluginAsync = async (app) => {
  const openApiOptions: FastifyDynamicSwaggerOptions = {
    openapi: {
      info: {
        title: packageJSON.name,
        description: packageJSON.description,
        version: packageJSON.version
      }
    }
  };

  await app.register(fastifySwagger, openApiOptions);

  const openApiUiOptions: FastifySwaggerUiOptions = {
    routePrefix: 'docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  };

  await app.register(fastifySwaggerUi, openApiUiOptions);
};

export default fp(docsPlugin);
