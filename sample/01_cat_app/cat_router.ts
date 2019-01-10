import { abc } from "https://deno.land/x/abc/mod.ts";
import { findAll, findOne, create } from "cat_handler.ts";

abc()
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .start("0.0.0.0:8888");
