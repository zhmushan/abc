import { join } from "../vendor/https/deno.land/std/path/mod.ts";
import {
  assert,
  assertEquals,
} from "../vendor/https/deno.land/std/testing/asserts.ts";
import { BufReader } from "../vendor/https/deno.land/std/io/bufio.ts";
import { TextProtoReader } from "../vendor/https/deno.land/std/textproto/mod.ts";
const { run, test, execPath, chdir, cwd } = Deno;

const dir = join(import.meta.url, "..");
const addr = "http://localhost:8080";
let server: Deno.Process;

async function startServer(fpath: string): Promise<void> {
  server = run({
    cmd: [execPath(), "run", "--allow-net", "--allow-read", fpath],
    stdout: "piped",
  });
  assert(server.stdout != null);
  const r = new TextProtoReader(new BufReader(server.stdout));
  const s = await r.readLine();
  assert(s !== null && s.includes("server listening"));
}

function killServer(): void {
  server.close();
  server.stdout?.close();
}

test("exmaples cat app", async function () {
  await startServer(join(dir, "./cat_app/main.ts"));
  try {
    const cat = { name: "zhmushan", age: 18 };
    const createdCat = await fetch(addr, {
      method: "POST",
      body: JSON.stringify(cat),
      headers: {
        "content-type": "application/json",
      },
    }).then((resp) => resp.json());
    const foundCats = await fetch(addr).then((resp) => resp.json());
    const foundCat = await fetch(`${addr}/1`).then((resp) => resp.json());

    assertEquals(createdCat, { id: 1, ...cat });
    assertEquals(foundCat, createdCat);
    assertEquals(foundCats, [foundCat]);
  } finally {
    killServer();
  }
});

test("exmaples jsx", async function () {
  await startServer(join(dir, "./jsx/main.jsx"));
  try {
    const text = await fetch(addr).then((resp) => resp.text());
    assertEquals(text, `<h1 data-reactroot="">Hello</h1>`);
  } finally {
    killServer();
  }
});

// test("exmaples template", async function () {
//   chdir(join(cwd(), "./examples/template"));
//   await startServer(join(dir, "./template/main.ts"));
//   try {
//     const text = await fetch(addr).then((resp) => resp.text());
//     assert(text.includes("hello, zhmushan!"));
//   } finally {
//     killServer();
//   }
// });
