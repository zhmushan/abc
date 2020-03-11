// TODO: waiting for denoland/deno#4297
// import type { MiddlewareFunc, HandlerFunc } from "./types.ts";

import { MiddlewareFunc, HandlerFunc } from "./types.ts";

import { assertEquals, runIfMain } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { Application } from "./app.ts";
const { test } = Deno;

test(async function GroupMiddleware(): Promise<void> {
  const app = new Application();
  const g = app.group("group");
  const h: HandlerFunc = function(): void {
    return;
  };
  const m1: MiddlewareFunc = next => c => next(c);
  const m2: MiddlewareFunc = next => c => next(c);
  const m3: MiddlewareFunc = next => c => next(c);
  const m4: MiddlewareFunc = () =>
    c => {
      c.response.status = 404;
    };
  const m5: MiddlewareFunc = () =>
    c => {
      c.response.status = 405;
    };

  g.use(m1, m2, m3);
  g.get("/404", h, m4);
  g.get("/405", h, m5);
  app.start({ port: 8080 });
  let res = await fetch("http://localhost:8080/group/404");
  assertEquals(res.status, Status.NotFound);
  res = await fetch("http://localhost:8080/group/405");
  assertEquals(res.status, Status.MethodNotAllowed);
  app.close();
});

runIfMain(import.meta);
