import { join } from "../vendor/https/deno.land/std/path/mod.ts";
const { readDir, run, execPath } = Deno;

const files: string[] = [];

await resolveDir("./");

const processes: Promise<any>[] = [];

for (const i of files) {
  processes.push(
    run({
      cmd: [execPath(), "cache", i],
      stdout: "piped",
    }).output(),
  );
}

await Promise.all(processes);

async function resolveDir(p: string): Promise<void> {
  for await (const entry of readDir(p)) {
    const np = join(p, entry.name);
    if (entry.isDirectory) {
      await resolveDir(np);
    } else if (/\.[j|t]sx?$/.test(np)) {
      files.push(np);
    }
  }
}
