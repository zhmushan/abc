import { assertEquals } from "../vendor/https/deno.land/std/testing/asserts.ts";
import {
  bench,
  runBenchmarks,
} from "../vendor/https/deno.land/std/testing/bench.ts";
import { Application } from "../mod.ts";
import paths from "./paths.ts";

const app = new Application();

for (const i of paths) {
  app.any(i, async (c) => c.path);
}

app.start({ port: 8080 });

bench({
  name: "simple app",
  runs: 8,
  async func(b): Promise<void> {
    b.start();
    const conns = [];
    for (let i = 0; i < 50; ++i) {
      conns.push(fetch("http://localhost:8080/").then((resp) => resp.text()));
    }
    await Promise.all(conns);
    for await (const i of conns) {
      assertEquals(i, "/");
    }
    b.stop();
  },
});

runBenchmarks().finally(() => {
  app.close();
});
