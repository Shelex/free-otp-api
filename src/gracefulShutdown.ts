import { browser } from './browser/cluster.js';
import { consola } from 'consola';

export const setGracefulShutdown = () => {
  for (const eventName of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(eventName, async () => {
      consola.info(`Received ${eventName}. Closing...`);
      await browser.closeCluster();
      process.exit(0);
    });
  }
};
