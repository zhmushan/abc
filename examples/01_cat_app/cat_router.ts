import { abc } from "../../mod.ts";
import { findAll, findOne, create } from "./cat_handler.ts";

abc()
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .start({ port: 8080 });

console.log(`server listening on 8080`);
