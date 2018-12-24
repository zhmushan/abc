import { test, assertEqual } from "https://deno.land/x/testing/testing.ts";
import { Router } from "router.ts";
import { context } from "context.ts";

test(function testRouter() {
  const r = new Router();
  r.add("GET", "/hello", c => true);
  let c = context({} as any);
  assertEqual(r.find("GET", "/hello", c)(c), true);

  r.add("GET", "/hello/:p", c => true);
  c = context({} as any);
  assertEqual(r.find("GET", "/hello/a", c)(c), true);
  assertEqual(r.find("GET", "/hello/b", c)(c), true);
  assertEqual(r.find("GET", "/hello/a/a", c), undefined);
});
