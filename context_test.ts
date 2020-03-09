import { assertEquals, runIfMain, createMockRequest } from "./dev_deps.ts";
import { Context } from "./context.ts";
const { test } = Deno;

const options = { app: undefined!, r: createMockRequest() };

test(function StringResponse(): void {
  const results = [
    `{foo: "bar"}`,
    `<h1>Title</h1>`,
    `foo`,
    `foo=bar`,
    `undefined`,
    `null`,
    `0`,
    `true`,
    ``
  ];
  const c = new Context(options);
  for (const r of results) {
    c.string(r);
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode(r));
    assertEquals(c.response.headers!.get("Content-Type"), "text/plain");
  }
});

test(function JSONResponse(): void {
  const results = [{ foo: "bar" }, `{foo: "bar"}`, [1, 2], {}, [], `[]`];
  const c = new Context(options);
  for (const r of results) {
    c.json(r);
    assertEquals(c.response.status, 200);
    assertEquals(
      c.response.body,
      new TextEncoder().encode(typeof r === "object" ? JSON.stringify(r) : r)
    );
    assertEquals(c.response.headers!.get("Content-Type"), "application/json");
  }
});

test(function HTMLResponse(): void {
  const results = [
    `{foo: "bar"}`,
    `<h1>Title</h1>`,
    `foo`,
    `foo=bar`,
    `undefined`,
    `null`,
    `0`,
    `true`,
    ``
  ];
  const c = new Context(options);
  for (const r of results) {
    c.html(r);
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode(r));
    assertEquals(c.response.headers!.get("Content-Type"), "text/html");
  }
});

runIfMain(import.meta);
