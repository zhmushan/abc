import { abc } from "../../mod.ts";
import { renderFile } from "https://deno.land/x/dejs/mod.ts";

const app = abc();

app.renderer = {
  render<T>(name: string, data: T) {
    return renderFile(name, data);
  }
};

app
  .get("/", c => c.render("./index.html", { name: "zhmushan" }))
  .start({ port: 8080 });

console.log(`server listening on 8080`);
