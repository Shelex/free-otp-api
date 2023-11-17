import { FromSchema } from 'json-schema-to-ts';
import { FastifySchema } from 'fastify';
import { allowedCountries, Source } from '../providers/index.js';

const paramsSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: allowedCountries,
      default: 'USA'
    },
    phoneNumber: { type: 'string', minLength: 10, maxLength: 13, pattern: '^[0-9]+$', default: '19137886215' }
  },
  required: ['country', 'phoneNumber']
} as const;

export type Params = FromSchema<typeof paramsSchema>;

const querystringSchema = {
  type: 'object',
  properties: {
    ago: {
      type: 'string',
      description: 'specify relative time since last sms received',
      nullable: true,
      pattern: '^[0-9]+[smh]$',
      default: '30s'
    },
    since: { type: 'number', description: 'specify exact timestamp since last sms received', nullable: true },
    match: { type: 'string', description: 'specify substring to match in sms', nullable: true },
    source: {
      type: 'string',
      description: 'specify phone number provider',
      enum: Object.values(Source),
      default: Source.ReceiveSmsFree,
      nullable: true
    }
  }
} as const;

export type Querystring = FromSchema<typeof querystringSchema>;

const resultSchema = {
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
    },
    url: {
      type: 'string'
    }
  }
} as const;

export const replySchema = {
  $id: 'responsePhoneMessage',
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
        }
      }
    },
    result: resultSchema,
    results: {
      description: 'if there are more than 1 match',
      type: 'array',
      items: resultSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const;

export type Reply = FromSchema<typeof replySchema>;

export const replyError = {
  $id: 'errorPhoneMessage',
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
  tags: ['Free Phones'],
  summary: 'Get OTP code from phone number',
  querystring: querystringSchema,
  params: paramsSchema,
  response: {
    200: replySchema,
    default: replyError
  }
};
