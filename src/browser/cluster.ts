import { Cluster } from 'puppeteer-cluster';
import vanillaPuppeteer, { Page } from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { consola } from 'consola';
import { createLock } from './lock.js';
import { waitFor } from '../time/utils.js';

const creatingCluster = createLock('creating cluster');

const createCluster = async () => {
  const puppeteer = addExtra(vanillaPuppeteer);

  puppeteer.use(stealthPlugin());

  const browserArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

  if (process.env.PROXY) {
    browserArgs.push(`--proxy-server=${process.env.PROXY}`);
  }

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 5, // 5 pages at a time
    timeout: 120 * 1000, // 2 minutes
    puppeteer,
    sameDomainDelay: 1000,
    puppeteerOptions: {
      headless: 'new',
      handleSIGINT: true,
      handleSIGHUP: true,
      handleSIGTERM: true,
      waitForInitialPage: false,
      args: browserArgs
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

  async createCluster(): Promise<void> {
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
    creatingCluster.release();
    try {
      await this.cluster.idle();
    } catch (e) {
      if (!this.cluster && !creatingCluster.isLocked) {
        return await this.createCluster();
      }
    }
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
    if (this.cluster) {
      consola.info('cluster available, waiting for idle...');
      await this.cluster.idle();
      await this.closeCluster();
    }
  }

  registerPageHandlers(page: Page) {
    page.on('error', (err) => {
      consola.warn(`[cluster] error event: ${err.message}`);
    });
  }
}

export const browser = new Puppeteer();
