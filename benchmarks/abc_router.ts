import routes from "./db.json";
import { Node } from "../mod.ts";

const h = 1 as any;

const node = new Node();

let begin = Date.now();
for (const r of routes) {
  node.addRoute(r, h);
}
let end = Date.now();
console.log((end - begin) / routes.length);

begin = Date.now();
for (const r of routes) {
  node.getValue(r);
}
end = Date.now();
console.log((end - begin) / routes.length);
