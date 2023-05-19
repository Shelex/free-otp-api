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
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10, // 10 pages at a time
    timeout: 120 * 1000, // 2 minutes
    puppeteer,
    monitor: true,
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

    this.cluster = await createCluster();
    await this.cluster.idle();
    creatingCluster.release();
  }

  async closeCluster() {
    consola.info('closing cluster...');
    if (!this.cluster) {
      return;
    }

    await this.cluster.close();
    this.cluster = undefined;
  }

  async refreshCluster() {
    consola.info('refreshing cluster...');
    if (this.cluster) {
      consola.info('cluster available, waiting for idle...');
      await this.cluster.idle();
      await this.closeCluster();
    }
  }
}

export const browser = new Puppeteer();
