import { test, assertEquals } from "./dev_deps.ts";
import { context } from "./context.ts";

test({
  name: "context string",
  fn() {
    let c = context();
    c.string("{foo: 'bar'}");
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEquals(c.response.headers.get("Content-Type"), "text/plain");
  }
});

test({
  name: "context json",
  fn() {
    let c = context();
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
    let c = context();
    c.html("{foo: 'bar'}");
    assertEquals(c.response.status, 200);
    assertEquals(c.response.body, new TextEncoder().encode("{foo: 'bar'}"));
    assertEquals(c.response.headers.get("Content-Type"), "text/html");
  }
});
