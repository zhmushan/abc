import { assertEquals, runIfMain } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { createMockRequest, createMockBodyReader } from "./test_util.ts";
import { Context } from "./context.ts";
import { Header, MIME } from "./constants.ts";
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
    assertEquals(c.response.headers!.get("Content-Type"), "text/plain");
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
    assertEquals(c.response.headers!.get("Content-Type"), "application/json");
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
    assertEquals(c.response.headers!.get("Content-Type"), "text/html");
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
  c.request.headers.append("Cookie", "PREF=al=en-GB&f1=123; wide=1; SID=123");
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

test("context multipart/form-data req", async function (): Promise<void> {
  const options = {
    app: undefined!,
    r: createMockRequest({
      body: createMockBodyReader(
        `------WebKitFormBoundary4HgCv3WldXbH8Iob\r\nContent-Disposition: form-data; name="foo"\r\n\r\nbar\r\n------WebKitFormBoundary4HgCv3WldXbH8Iob\r\nContent-Disposition: form-data; name="foo1"\r\n\r\nbar1\r\n------WebKitFormBoundary4HgCv3WldXbH8Iob\r\nContent-Disposition: form-data; name="foo2"\r\n\r\nbar2\r\n------WebKitFormBoundary4HgCv3WldXbH8Iob--`,
      ),
      headers: new Headers({
        [Header.ContentType]: MIME.MultipartForm +
          "; boundary=----WebKitFormBoundary4HgCv3WldXbH8Iob",
      }),
    }),
  };
  const c = new Context(options);
  const body = await c.body();

  assertEquals(body, {
    foo: "bar",
    foo1: "bar1",
    foo2: "bar2",
  });
});

test("context application/x-www-form-urlencoded req", async function (): Promise<
  void
> {
  const options = {
    app: undefined!,
    r: createMockRequest({
      body: createMockBodyReader("foo=bar"),
      headers: new Headers({ [Header.ContentType]: MIME.ApplicationForm }),
    }),
  };

  const c = new Context(options);
  const body = await c.body();

  assertEquals(body, { foo: "bar" });
});

test("context application/json req", async function (): Promise<void> {
  const options = {
    app: undefined!,
    r: createMockRequest({
      body: createMockBodyReader(`{"foo":"bar"}`),
      headers: new Headers({ [Header.ContentType]: MIME.ApplicationJSON }),
    }),
  };

  const c = new Context(options);
  const body = await c.body();

  assertEquals(body, { foo: "bar" });
});

test("context text/plain req", async function (): Promise<void> {
  const options = {
    app: undefined!,
    r: createMockRequest({
      body: createMockBodyReader(`{"foo":"bar"}`),
      headers: new Headers({ [Header.ContentType]: MIME.TextPlain }),
    }),
  };

  const c = new Context(options);
  const body = await c.body();

  assertEquals(body, `{"foo":"bar"}`);
});

runIfMain(import.meta);
