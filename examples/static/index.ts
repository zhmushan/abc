import { Application } from "../../mod.ts";

const app = new Application();
const port = 8080;
/**
 * if MiddlewareFunc length more than 2
 */
app.static("", "assets",
  (h) => (c):any => {
    c.response.headers.set("Access-Control-Allow-Origin", "*");
  },
  (h) => (c) => {
    c.response.headers.set("Catch-Control", "no-store");
  }
  )
  .start({ port });

console.log(`server listening on http://localhost:${port}\nplease add suffix from assets folder~`);
