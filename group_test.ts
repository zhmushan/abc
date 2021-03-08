import type { HandlerFunc, MiddlewareFunc } from "./types.ts";

import { assertEquals } from "./vendor/https/deno.land/std/testing/asserts.ts";
import { Status } from "./vendor/https/deno.land/std/http/http_status.ts";
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

  const u = app.group("user");

  const check: MiddlewareFunc = (next) => {
    return function (c) {
      const { id } = c.params as { id: string };
      if (id === "zhmushan") {
        c.set("role", "admin");
      } else {
        c.set("role", "user");
      }
      return next(c);
    };
  };

  u.get("/", (_) => "/");
  u.get("/:id", (c) => {
    const role = c.get("role") as string;
    return role;
  });

  u.use(check);

  res = await fetch(`${addr}/user/zhmushan`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "admin");
  res = await fetch(`${addr}/user/MuShan`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "user");
  await app.close();
});
