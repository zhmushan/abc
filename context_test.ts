import { assertEquals, runIfMain } from "./dev_deps.ts";
import { createMockRequest } from "./test_util.ts";
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

test(function RequestWithCookies(): void {
  const c = new Context(options);
  c.request.headers.append("Cookie", "PREF=al=en-GB&f1=123; wide=1; SID=123");
  assertEquals(c.cookies, {
    PREF: "al=en-GB&f1=123",
    wide: "1",
    SID: "123"
  });
  c.setCookie({
    name: "hello",
    value: "world"
  });
  assertEquals(c.response.headers?.get("Set-Cookie"), "hello=world");
});

runIfMain(import.meta);
