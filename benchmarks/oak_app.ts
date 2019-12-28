import staticRoutes from "./static_routes.json";
import paramsRoutes from "./params_routes.json";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

for (const r of staticRoutes) {
  router.all(r, c => {
    c.response.body = r;
  });
}
for (const r of paramsRoutes) {
  router.all(r, c => {
    c.response.body = r;
  });
}
app.use(router.routes());

await app.listen("127.0.0.1:8080");
