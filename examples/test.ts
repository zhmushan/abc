import { path } from "../deps.ts";
import {
  assert,
  assertEquals,
  TextProtoReader,
  BufReader,
} from "../dev_deps.ts";
const { run, test, execPath } = Deno;

const dir = path.join(import.meta.url, "..");
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
  await startServer(path.join(dir, "./cat_app/main.ts"));
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
  await startServer(path.join(dir, "./jsx/main.tsx"));
  try {
    const text = await fetch(addr).then((resp) => resp.text());
    assertEquals(text, `<h1 data-reactroot="">Hello</h1>`);
  } finally {
    killServer();
  }
});

// test("exmaples template", async function () {
//   await startServer(path.join(dir, "./template/main.ts"));
//   try {
//     const text = await fetch(addr).then((resp) => resp.text());
//     assert(text.includes("hello, zhmushan!"));
//   } finally {
//     killServer();
//   }
// });
