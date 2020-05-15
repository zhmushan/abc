import { Application } from "../../mod.ts";
import { cors } from "../../middleware/cors.ts";

const app = new Application();
const port = 8080;
app.static("/", "./assets", cors()).start({ port });

console.log(`server listening on http://localhost:${port}`);
