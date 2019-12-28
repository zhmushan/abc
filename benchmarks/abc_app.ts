import staticRoutes from "./static_routes.json";
import paramsRoutes from "./params_routes.json";
import { abc } from "../abc.ts";

const Port = 8080;

const app = abc();
for (const r of staticRoutes) {
  app.any(r, () => r);
}
for (const r of paramsRoutes) {
  app.any(r, () => r);
}
app.start({ port: Port });

console.log(`server listening on ${Port}`);
