import { createClient } from 'redis';
import { PhoneNumber } from '../providers/types.js';
import { consola } from 'consola';

export const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
});

client.on('error', (err) => consola.info('redis client err: %s', err)).connect();

const getKey = (sourceName: string, country: string) => `${sourceName}|${country}`;

export const savePhones = async (sourceName: string, country: string, phones: PhoneNumber[]) => {
  try {
    await client.set(getKey(sourceName, country), JSON.stringify(phones), { EX: 12 * 60 * 60 });
  } catch (e) {
    consola.warn(e);
  }
};

export const getPhones = async (sourceName: string, country: string): Promise<PhoneNumber[]> => {
  try {
    const result = await client.get(getKey(sourceName, country));
    if (!result) {
      return [];
    }
    return result ? JSON.parse(result) : [];
  } catch (e) {
    consola.warn(e);
    return [];
  }
};
