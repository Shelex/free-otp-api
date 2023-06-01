import { FromSchema } from 'json-schema-to-ts';
import { countries } from '../providers/receive-sms-free-cc/countries.js';
import { FastifySchema } from 'fastify';

const listParamsSchema = {
  type: 'object',
  properties: {
    country: { type: 'string', enum: countries, default: 'USA' }
  },
  required: ['country']
} as const;

export type ListParams = FromSchema<typeof listParamsSchema>;

export const replyListSchema = {
  $id: 'responseList',
  type: 'object',
  properties: {
    phones: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  additionalProperties: false
} as const;

export const replyListError = {
  $id: 'errorList',
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
  params: listParamsSchema,
  response: {
    200: replyListSchema,
    default: replyListError
  }
};
