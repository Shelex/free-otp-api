import Fastify from 'fastify';
import { browser } from './browser/cluster.js';
import { setGracefulShutdown } from './gracefulShutdown.js';
import swagger from './plugins/swagger.js';
import routes from './routes/index.js';
import websockets from './plugins/websocket.js';

const app = Fastify();
await app.register(swagger);
await app.register(routes);
await app.register(websockets);

setInterval(async () => {
  await browser.refreshCluster();
  // close cluster every 10 minutes to avoid leaks
}, 10 * 60 * 1000);

setGracefulShutdown();

app.listen({ port: parseInt(process.env.PORT || '') || 3030 }, (err) => {
  if (err) throw err;
});
