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
    ago: { type: 'string', nullable: true, pattern: '^[0-9]+[smh]$', default: '30s' },
    match: { type: 'string', nullable: true }
  }
} as const;

export type Querystring = FromSchema<typeof querystringSchema>;

export const replySchema = {
  $id: 'response',
  type: 'object',
  properties: {
    requested: {
      type: 'object',
      properties: {
        country: {
          type: 'string'
        },
        phoneNumber: {
          type: 'string'
        },
        ago: {
          type: 'number'
        },
        agoText: {
          type: 'string',
          nullable: true
        },
        match: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      }
    },
    result: {
      type: 'object',
      properties: {
        ago: {
          type: 'number'
        },
        agoText: {
          type: 'string'
        },
        message: {
          type: 'string'
        },
        otp: {
          type: 'string'
        }
      }
    }
  },
  additionalProperties: false
} as const;

export type Reply = FromSchema<typeof replySchema>;

export const replyError = {
  $id: 'error',
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string', nullable: true }
  },
  additionalProperties: false
} as const;

export type ReplyError = FromSchema<typeof replyError>;

export const getOtpCodeSchema: FastifySchema = {
  querystring: querystringSchema,
  params: paramsSchema,
  response: {
    200: replySchema,
    default: replyError
  }
};
