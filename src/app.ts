import Fastify from 'fastify';
import dotenv from 'dotenv';
import { browser } from './browser/cluster.js';
import { setGracefulShutdown } from './gracefulShutdown.js';
import swagger from './plugins/swagger.js';
import cors from './plugins/cors.js';
import health from './plugins/health.js';
import routes from './routes/index.js';
import { jobs } from './scheduler/cron.js';

dotenv.config();

const app = Fastify({ logger: true });
await app.register(cors);
await app.register(health);
await app.register(swagger);
await app.register(routes);

setInterval(async () => {
  await browser.refreshCluster();
  // close cluster every 10 minutes to avoid leaks
}, 10 * 60 * 1000);

setGracefulShutdown();

// resume all jobs when app initialized
Object.values(jobs).map((job) => job.resume());

app.listen({ port: parseInt(process.env.PORT ?? '') || 3030, host: process.env.HOST ?? '0.0.0.0' }, (err) => {
  if (err) throw err;
});
