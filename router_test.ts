import { assertEquals, runIfMain, createMockRequest } from "./dev_deps.ts";
import Router from "./router.ts";
import Context from "./context.ts";
import { HttpMethod } from "./constants.ts";
import { HandlerFunc } from "./types.ts";
const { test } = Deno;

test(function RouterBasic(): void {
  const r = new Router();
  const h: HandlerFunc = c => c.path;
  const c = new Context({ app: undefined!, r: createMockRequest("/get") });
  r.add(HttpMethod.Get, "/get", h);
  assertEquals(r.find(HttpMethod.Get, c), h);
});

runIfMain(import.meta);
