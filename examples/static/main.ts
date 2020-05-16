import { Application } from "../../mod.ts";
import { cors } from "../../middleware/cors.ts";

const app = new Application();
const port = 8080;
const wrapper = (data: any, type: string | undefined): Uint8Array => {
  let string = "Wrapper Function has changed data";
  console.log(type);
  return new TextEncoder().encode(string);
};
app.static("", "./assets", wrapper, cors()).start({ port });

console.log(`server listening on http://localhost:${port}/read.txt`);
