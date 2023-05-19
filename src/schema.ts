import { countries } from './providers/receive-sms-free-cc.js';

const queryStringJsonSchema = {
  type: 'object',
  properties: {
    ago: { type: 'string', nullable: true, pattern: '^[0-9]+[smh]$' },
    match: { type: 'string', nullable: true }
  }
};

const paramsJsonSchema = {
  type: 'object',
  properties: {
    country: { type: 'string', enum: countries },
    phoneNumber: { type: 'string', minLength: 10, maxLength: 13, pattern: '^[0-9]+$' }
  }
};

export const schema = {
  querystring: queryStringJsonSchema,
  params: paramsJsonSchema
};
