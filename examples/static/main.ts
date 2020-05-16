import { Application } from "../../mod.ts";
import { cors } from "../../middleware/cors.ts";

const app = new Application();
const port = 8080;
const wrapper = (data: any): Uint8Array => {
  let string = "Wrapper Function changes this data";
  return new TextEncoder().encode(string);
};
app.static("", "./assets", wrapper, cors()).start({ port });
// app.file("read.txt","./assets/read.txt").start({port})

console.log(`server listening on http://localhost:${port}/read.txt`);
