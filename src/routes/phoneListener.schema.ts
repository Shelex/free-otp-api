import { FromSchema } from 'json-schema-to-ts';
import { countries } from '../providers/receive-sms-free-cc/countries.js';
import { FastifySchema } from 'fastify';

const paramsSchema = {
  type: 'object',
  properties: {
    country: { type: 'string', enum: countries, default: 'USA' },
    phoneNumber: { type: 'string', minLength: 10, maxLength: 13, pattern: '^[0-9]+$', default: '19137886215' }
  },
  required: ['country', 'phoneNumber']
} as const;

export type Params = FromSchema<typeof paramsSchema>;

const querystringSchema = {
  type: 'object',
  properties: {
    match: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
} as const;

export type Querystring = FromSchema<typeof querystringSchema>;

export const replyListenerSchema = {
  $id: 'responseListener',
  type: 'string',
  additionalProperties: false
} as const;

export type ReplyListener = FromSchema<typeof replyListenerSchema>;

export const getOtpCodeListenerSchema: FastifySchema = {
  params: paramsSchema,
  querystring: querystringSchema,
  response: {
    200: replyListenerSchema,
    default: replyListenerSchema
  }
};
