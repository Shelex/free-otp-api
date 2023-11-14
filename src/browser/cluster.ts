import { Cluster } from 'puppeteer-cluster';
import vanillaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import adblockPlugin from 'puppeteer-extra-plugin-adblocker';
import { consola } from 'consola';
import { createLock } from './lock.js';
import { waitFor } from '../time/utils.js';

const creatingCluster = createLock('creating cluster');

const createCluster = async () => {
  const puppeteer = addExtra(vanillaPuppeteer);
  //@ts-expect-error no types
  puppeteer.use(stealthPlugin()).use(adblockPlugin({ blockTrackers: true }));

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 15, // 15 pages at a time
    timeout: 120 * 1000, // 2 minutes
    puppeteer,
    sameDomainDelay: 1000,
    puppeteerOptions: {
      headless: 'new',
      handleSIGINT: true,
      handleSIGHUP: true,
      handleSIGTERM: true,
      waitForInitialPage: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  await cluster.idle();

  return cluster;
};

interface ProviderEntry {
  country: string;
  number: string;
}

class Puppeteer {
  cluster?: Cluster;
  providers: Record<string, ProviderEntry[]> = {};

  async createCluster() {
    consola.info('Puppeteer.createCluster');
    if (this.cluster) {
      consola.info('Puppeteer cluster already available');
      return;
    }
    if (creatingCluster.isLocked) {
      consola.info('creation cluster already in progress');
      await waitFor(() => !creatingCluster.isLocked);
      return;
    }
    consola.info('creating new cluster...');
    creatingCluster.acquire();

    if (!creatingCluster.isLocked) {
      consola.info('lock was not granted');
      return;
    }

    try {
      this.cluster = await createCluster();
      await this.cluster.idle();
    } catch (e) {
      consola.error(`failed to create cluster: ${JSON.stringify(e, null, 2)}`);
    } finally {
      creatingCluster.release();
    }
  }

  async closeCluster() {
    consola.info('closing cluster...');
    if (!this.cluster) {
      return;
    }

    try {
      await this.cluster.close();
      this.cluster = undefined;
    } catch (e) {
      consola.error(`failed to close cluster: ${JSON.stringify(e, null, 2)}`);
    }
  }

  async refreshCluster() {
    if (this.cluster) {
      consola.info('cluster available, waiting for idle...');
      try {
        await this.cluster.idle();
        await this.closeCluster();
      } catch (e) {
        consola.error(`failed to refresh cluster: ${JSON.stringify(e, null, 2)}`);
      }
    }
  }
}

export const browser = new Puppeteer();
