import { path } from "../deps.ts";
import { assertEquals } from "../dev_deps.ts";
const { run, test, execPath } = Deno;

const dir = path.join(import.meta.url, "..");

test(async function ExmaplesCatApp() {
  let p = run({
    cmd: [execPath(), "fetch", path.join(dir, "./cat_app/main.ts")],
    stderr: "piped",
  });

  assertEquals((await p.stderrOutput()).length, 0);
  p.close();
});

test(async function ExmaplesJSX() {
  let p = run({
    cmd: [execPath(), "fetch", path.join(dir, "./jsx/main.tsx")],
    stderr: "piped",
  });

  assertEquals((await p.stderrOutput()).length, 0);
  p.close();
});

test(async function ExmaplesTemplate() {
  let p = run({
    cmd: [execPath(), "fetch", path.join(dir, "./template/main.ts")],
    stderr: "piped",
  });

  assertEquals((await p.stderrOutput()).length, 0);
  p.close();
});
