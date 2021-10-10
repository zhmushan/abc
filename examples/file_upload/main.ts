import type { FormFile } from "../../vendor/https/deno.land/std/mime/multipart.ts";
import { Application } from "../../mod.ts";

const decoder = new TextDecoder();

const app = new Application();

app.start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);

app.post("/file", async ({ req }) => {
  const { file } = await c.body as { file: FormFile };
  return {
    name: file.filename,
    content: decoder.decode(file.content),
  };
});
