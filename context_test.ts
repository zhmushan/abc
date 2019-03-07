import { context } from "./context.ts";
import { assertEquals } from "https://deno.land/x/testing/asserts.ts";
import { test } from "https://deno.land/x/testing/mod.ts";

function injectContext(r = {}) {
  return context(r as any);
}

test({
  name: "context string",
  fn() {
    let c = injectContext();
    c.string("{foo: 'bar'}");
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEquals(c.response.headers.get("Content-Type"), "text/plain");
  }
});

test({
  name: "context json",
  fn() {
    let c = injectContext();
    c.json({ foo: "bar" });
    assertEquals(c.response.status, 200);
    assertEquals(
      c.response.body,
      new TextEncoder().encode(JSON.stringify({ foo: "bar" }))
    );
    assertEquals(c.response.headers.get("Content-Type"), "application/json");
  }
});

test({
  name: "context html",
  fn() {
    let c = injectContext();
    c.html("{foo: 'bar'}");
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEquals(c.response.headers.get("Content-Type"), "text/html");
  }
});
