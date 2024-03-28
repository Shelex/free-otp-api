import { FromSchema } from 'json-schema-to-ts';
import { FastifySchema } from 'fastify';

export const replyCountriesSchema = {
  $id: 'responseCountries',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      country: { type: 'string' },
      source: { type: 'string' },
      count: { type: 'number' }
    }
  },
  additionalProperties: false
} as const;

export const replyCountriesError = {
  $id: 'errorCountries',
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string', nullable: true }
  },
  additionalProperties: false
} as const;

export type ReplyCountries = FromSchema<typeof replyCountriesSchema>;
export type ReplyCountriesError = FromSchema<typeof replyCountriesError>;

export const listCountriesSchema: FastifySchema = {
  tags: ['Countries'],
  summary: 'Get list of available countries',
  response: {
    200: replyCountriesSchema,
    default: replyCountriesError
  }
};
