import { Application } from "../../mod.ts";
import { renderFile } from "../../vendor/https/deno.land/x/dejs/mod.ts";
import { readAll } from "../../vendor/https/deno.land/std/io/util.ts";

const app = new Application();

app.renderer = {
  async render<T>(name: string, data: T): Promise<Uint8Array> {
    return renderFile(name, data).then(readAll);
  },
};

app
  .get("/", async (c) => {
    await c.render("./index.html", { name: "zhmushan" });
  })
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
