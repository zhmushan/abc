import staticRoutes from "./static_routes.json";
import paramsRoutes from "./params_routes.json";
import { abc } from "../mod.ts";

const addr = { port: 8080 };
const app = abc();
for (const r of staticRoutes) {
  app.any(r, () => r);
}
for (const r of paramsRoutes) {
  app.any(r, () => r);
}
app.start(addr);
console.log(`server listening on ${addr}`);
