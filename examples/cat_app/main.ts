import { Application } from "../../mod.ts";
import { create, findAll, findOne } from "./handler.ts";

const app = new Application();

app
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
