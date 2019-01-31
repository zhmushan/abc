import { context } from "context.ts";
import { assertEqual, test } from "https://deno.land/x/testing/mod.ts";

function injectContext(r = {}) {
  return context(r as any);
}

test({
  name: "context string",
  fn() {
    let c = injectContext();
    c.string("{foo: 'bar'}");
    assertEqual(c.response.status, 200);
    assertEqual(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEqual(c.response.headers.get("Content-Type"), "text/plain");
  }
});

test({
  name: "context json",
  fn() {
    let c = injectContext();
    c.json({ foo: "bar" });
    assertEqual(c.response.status, 200);
    assertEqual(
      c.response.body,
      new TextEncoder().encode(JSON.stringify({ foo: "bar" }))
    );
    assertEqual(c.response.headers.get("Content-Type"), "application/json");
  }
});

test({
  name: "context html",
  fn() {
    let c = injectContext();
    c.html("{foo: 'bar'}");
    assertEqual(c.response.status, 200);
    assertEqual(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEqual(c.response.headers.get("Content-Type"), "text/html");
  }
});
