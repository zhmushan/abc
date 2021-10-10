import {
  assertEquals,
  assertStringIncludes,
} from "./vendor/https/deno.land/std/testing/asserts.ts";
import { Status } from "./vendor/https/deno.land/std/http/http_status.ts";
import { createMockRequest } from "./test_util.ts";
import { Context } from "./context.ts";
import { Header } from "./constants.ts";
const { test } = Deno;

test("context string resp", function (): void {
  const options = { app: undefined!, r: createMockRequest() };
  const results = [
    `{foo: "bar"}`,
    `<h1>Title</h1>`,
    `foo`,
    `foo=bar`,
    `undefined`,
    `null`,
    `0`,
    `true`,
    ``,
  ];
  const c = new Context(options);
  for (const r of results) {
    c.string(r);
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode(r));
    assertStringIncludes(
      c.response.headers!.get("Content-Type") ?? "",
      "text/plain",
    );
  }
});

test("context json resp", function (): void {
  const options = { app: undefined!, r: createMockRequest() };
  const results = [{ foo: "bar" }, `{foo: "bar"}`, [1, 2], {}, [], `[]`];
  const c = new Context(options);
  for (const r of results) {
    c.json(r);
    assertEquals(c.response.status, 200);
    assertEquals(
      c.response.body,
      new TextEncoder().encode(typeof r === "object" ? JSON.stringify(r) : r),
    );
    assertStringIncludes(
      c.response.headers!.get("Content-Type") ?? "",
      "application/json",
    );
  }
});

test("context html resp", function (): void {
  const options = { app: undefined!, r: createMockRequest() };
  const results = [
    `{foo: "bar"}`,
    `<h1>Title</h1>`,
    `foo`,
    `foo=bar`,
    `undefined`,
    `null`,
    `0`,
    `true`,
    ``,
  ];
  const c = new Context(options);
  for (const r of results) {
    c.html(r);
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode(r));
    assertStringIncludes(
      c.response.headers!.get("Content-Type") ?? "",
      "text/html",
    );
  }
});

test("context file resp", async function (): Promise<void> {
  const options = { app: undefined!, r: createMockRequest() };
  const c = new Context(options);
  await c.file("./mod.ts");
  assertEquals(
    c.response.headers!.get("Content-Type"),
    "application/javascript; charset=UTF-8",
  );
});

test("context req with cookies", function RequestWithCookies(): void {
  const options = { app: undefined!, r: createMockRequest() };
  const c = new Context(options);
  c.req.headers.append("Cookie", "PREF=al=en-GB&f1=123; wide=1; SID=123");
  assertEquals(c.cookies, {
    PREF: "al=en-GB&f1=123",
    wide: "1",
    SID: "123",
  });
  c.setCookie({
    name: "hello",
    value: "world",
  });
  assertEquals(c.response.headers?.get("Set-Cookie"), "hello=world");
});

test("context redirect", function (): void {
  const options = { app: undefined!, r: createMockRequest() };
  const c = new Context(options);
  c.redirect("https://a.com");
  assertEquals(c.response.headers?.get(Header.Location), "https://a.com");
  assertEquals(c.response.status, Status.Found);
  c.redirect("https://b.com", Status.UseProxy);
  assertEquals(c.response.headers?.get(Header.Location), "https://b.com");
  assertEquals(c.response.status, Status.UseProxy);
});

test("context custom", function (): void {
  class CustomContext extends Context {
    constructor(c: Context) {
      super(c);
    }

    hello(): string {
      return "hello";
    }
  }

  const options = { app: undefined!, r: createMockRequest() };
  const c: Context = new CustomContext(new Context(options));
  const cc = c.customContext;

  assertEquals(cc.hello(), "hello");
});

test("context get set", function (): void {
  const c = new Context({ app: undefined!, r: createMockRequest() });

  c.set("Hello", "World");
  assertEquals(c.get("hello"), undefined);
  assertEquals(c.get("Hello"), "World");

  const key = Symbol("Hello");
  c.set(key, "World");
  assertEquals(c.get(Symbol("Hello")), undefined);
  assertEquals(c.get(key), "World");
});
