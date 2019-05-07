import * as Router from "koa-router";
import routes = require("./db.json");

const router = new Router();

let begin = Date.now();
for (const r of routes) {
  router.get(r, () => {});
}
let end = Date.now();
console.log((end - begin) / routes.length);

begin = Date.now();
for (const r of routes) {
  router.match(r, "get");
}
end = Date.now();
console.log((end - begin) / routes.length);
