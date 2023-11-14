import { FromSchema } from 'json-schema-to-ts';
import { FastifySchema } from 'fastify';

const authZeroBodySchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['url', 'username', 'password']
} as const;

export type AuthZeroBody = FromSchema<typeof authZeroBodySchema>;

export const replyAuthZeroSchema = {
  $id: 'responseAuthZero',
  type: 'object',
  properties: {
    token: {
      type: 'string'
    }
  },
  additionalProperties: false
} as const;

export const replyAuthZeroError = {
  $id: 'errorAuthZero',
  type: 'object',
  required: ['error'],
  properties: {
    error: { type: 'string' },
    message: { type: 'string', nullable: true }
  },
  additionalProperties: false
} as const;

export type ReplyAuthZero = FromSchema<typeof replyAuthZeroSchema>;
export type ReplyAuthZeroError = FromSchema<typeof replyAuthZeroError>;

export const authZeroSchema: FastifySchema = {
  tags: ['Auth0'],
  summary: 'Get Auth0 token from openID connect debugger page',
  body: authZeroBodySchema,
  response: {
    200: replyAuthZeroSchema,
    default: replyAuthZeroError
  }
};
