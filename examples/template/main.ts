import { Application } from "../../mod.ts";
import { renderFile } from "https://deno.land/x/dejs/mod.ts";

const app = new Application();

app.renderer = {
  render<T>(name: string, data: T): Promise<Deno.Reader> {
    return renderFile(name, data);
  },
};

app
  .get("/", async (c) => {
    await c.render("./index.html", { name: "zhmushan" });
  })
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
