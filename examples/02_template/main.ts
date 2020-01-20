import { abc, Context } from "../../mod.ts";
import { renderFile } from "https://deno.land/x/dejs/mod.ts";

const app = abc();

app.renderer = {
  render<T>(name: string, data: T): Promise<Deno.Reader> {
    return renderFile(name, data);
  }
};

app
  .get("/", (c: Context) => c.render("./index.html", { name: "zhmushan" }))
  .start({ port: 8080 });

console.log(`server listening on 8080`);
