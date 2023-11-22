import Fastify from 'fastify';
import dotenv from 'dotenv';
import { browser } from './browser/cluster.js';
import { setGracefulShutdown } from './gracefulShutdown.js';
import swagger from './plugins/swagger.js';
import cors from './plugins/cors.js';
import routes from './routes/index.js';
import { cachePhoneNumbersJob } from './scheduler/cron.js';

dotenv.config();

const app = Fastify();
await app.register(cors);
await app.register(swagger);
await app.register(routes);

setInterval(async () => {
  await browser.refreshCluster();
  // close cluster every 10 minutes to avoid leaks
}, 10 * 60 * 1000);

setGracefulShutdown();

cachePhoneNumbersJob.resume();

app.listen({ port: parseInt(process.env.PORT ?? '') || 3030 }, (err) => {
  if (err) throw err;
});
