import staticRoutes from "./static_routes.json";
import paramsRoutes from "./params_routes.json";
import { Application } from "../mod.ts";

const port = 8080;

const app = new Application();
for (const r of staticRoutes) {
  app.any(r, (): string => r);
}
for (const r of paramsRoutes) {
  app.any(r, (): string => r);
}
app.start({ port });

console.log(`server listening on http://localhost:${port}`);
