import { FromSchema } from 'json-schema-to-ts';
import { FastifySchema } from 'fastify';
import { Source, allowedCountries } from '../providers/index.js';

const listParamsSchema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: allowedCountries,
      default: 'USA'
    }
  },
  required: ['country']
} as const;

export type ListParams = FromSchema<typeof listParamsSchema>;

export const replyListSchema = {
  $id: 'responsePhonesList',
  type: 'object',
  properties: {
    phones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          value: { type: 'string' },
          source: { type: 'string', enum: Object.values(Source) }
        }
      }
    }
  },
  additionalProperties: false
} as const;

export const replyListError = {
  $id: 'errorPhonesList',
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string', nullable: true }
  },
  additionalProperties: false
} as const;

export type ReplyList = FromSchema<typeof replyListSchema>;
export type ReplyListError = FromSchema<typeof replyListError>;

export const listPhonesSchema: FastifySchema = {
  tags: ['Free Phones'],
  summary: 'Get list of available phone numbers',
  params: listParamsSchema,
  response: {
    200: replyListSchema,
    default: replyListError
  }
};
