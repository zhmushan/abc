import { Application } from "../../mod.ts";
import { session } from "../../middleware/session.ts";

const app = new Application();

app.use(session());

app
  .get("/", (c) => c.session.get("key"))
  .get("/set", (c) => c.session.set("key", "value"))
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
