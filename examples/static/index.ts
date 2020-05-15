import { Application } from "../../mod.ts";

const app = new Application();
const port=8080
app.static('', 'assets', h => c => {
  c.response.headers.set("Access-Control-Allow-Origin","*")
})
  .start({ port });

console.log(`server listening on http://localhost:${port}`);