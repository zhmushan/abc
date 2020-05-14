import type { MiddlewareFunc, HandlerFunc } from "./types.ts";

import { assertEquals, runIfMain } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { createApplication } from "./test_util.ts";
const { test } = Deno;

const addr = `http://localhost:8081`;

test("group middleware", async function (): Promise<void> {
  const app = createApplication();
  const g = app.group("group");
  const h: HandlerFunc = function (): void {
    return;
  };
  const m1: MiddlewareFunc = (next) => (c) => next(c);
  const m2: MiddlewareFunc = (next) => (c) => next(c);
  const m3: MiddlewareFunc = (next) => (c) => next(c);
  const m4: MiddlewareFunc = () =>
    (c) => {
      c.response.status = 404;
    };
  const m5: MiddlewareFunc = () =>
    (c) => {
      c.response.status = 405;
    };

  g.use(m1, m2, m3);
  g.get("/404", h, m4);
  g.get("/405", h, m5);
  let res = await fetch(`${addr}/group/404`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(await res.text(), "");
  res = await fetch(`${addr}/group/405`);
  assertEquals(res.status, Status.MethodNotAllowed);
  assertEquals(await res.text(), "");
  await app.close();
});

runIfMain(import.meta);
