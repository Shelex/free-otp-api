import { browser } from './browser/cluster.js';
import { consola } from 'consola';
import { client } from './repository/redis.js';

export const setGracefulShutdown = () => {
  for (const eventName of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(eventName, async () => {
      consola.info(`Received ${eventName}. Closing...`);
      client && (await client.disconnect());
      browser && (await browser.closeCluster());
      process.exit(0);
    });
  }
};
