import * as staticRoutes from "./static_routes.json";
import * as paramsRoutes from "./params_routes.json";
import * as express from "express";

const app = express();
const port = 8080;

for (const r of staticRoutes) {
  app.all(r, (req, res) => {
    res.send(r);
  });
}
for (const r of paramsRoutes) {
  app.all(r, (req, res) => {
    res.send(r);
  });
}
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
