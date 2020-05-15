import { HandlerFunc } from "./types.ts";

import { assertEquals, runIfMain } from "./dev_deps.ts";
import { createMockRequest } from "./test_util.ts";
import { Router } from "./router.ts";
import { Context } from "./context.ts";
import { HttpMethod } from "./constants.ts";
const { test } = Deno;

test("router basic", function (): void {
  const r = new Router();
  const h: HandlerFunc = (c) => c.path;
  const c = new Context({
    app: undefined!,
    r: createMockRequest({ url: "/get" }),
  });
  r.add(HttpMethod.Get, "/get", h);
  assertEquals(r.find(HttpMethod.Get, c), h);
});

runIfMain(import.meta);
