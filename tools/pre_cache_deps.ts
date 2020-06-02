import { join } from "../vendor/https/deno.land/std/path/mod.ts";
const { readDir, cwd } = Deno;

const vendorPath = join(cwd(), "vendor");

await resolveDir(vendorPath);

export async function resolveDir(p: string): Promise<void> {
  for await (const entry of readDir(p)) {
    const np = join(p, entry.name);
    entry.isDirectory ? await resolveDir(np) : await import(`file:///${np}`);
  }
}
