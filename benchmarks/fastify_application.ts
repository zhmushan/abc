import * as staticRoutes from "./static_routes.json";
import * as paramsRoutes from "./params_routes.json";
import * as fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";

const port = 8080;
const app: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});

for (const r of staticRoutes) {
  app.all(r, (request, reply) => {
    reply.send(r);
  });
}
for (const r of paramsRoutes) {
  app.all(r, (request, reply) => {
    reply.send(r);
  });
}

app.listen(port, (err, address) => {
  if (err) throw err;
  app.log.info(`server listening on ${address}`);
});
