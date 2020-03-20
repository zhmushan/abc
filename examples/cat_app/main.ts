import { Application } from "../../mod.ts";
import { findAll, findOne, create } from "./handler.ts";

const app = new Application();

app
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
