import type { FormFile } from "../../vendor/https/deno.land/std/mime/multipart.ts";
import { Application } from "../../mod.ts";
import { decoder } from "../../vendor/https/deno.land/std/encoding/utf8.ts";

const app = new Application();

app.start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);

app.post("/file", async (c) => {
  const { file } = await c.body as { file: FormFile };
  return {
    name: file.filename,
    content: decoder.decode(file.content),
  };
});
