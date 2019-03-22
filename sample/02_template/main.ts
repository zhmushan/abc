import { abc } from "https://deno.land/x/abc/mod.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";

const app = abc();

app.renderer = {
  render<T>(name: string, data: T) {
    return renderFile(name, data);
  }
};

app
  .get("/", c => c.render("./index.html", { name: "zhmushan" }))
  .start("0.0.0.0:8080");
