import { test, assertEquals } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { abc, MiddlewareFunc, HandlerFunc } from "./abc.ts";

let isFinished = false;

test(async function GroupMiddleware() {
  const app = abc();
  const g = app.group("group");
  const h: HandlerFunc = function() {};
  const m1: MiddlewareFunc = function(next) {
    return function(c) {
      return next(c);
    };
  };
  const m2: MiddlewareFunc = function(next) {
    return function(c) {
      return next(c);
    };
  };
  const m3: MiddlewareFunc = function(next) {
    return function(c) {
      return next(c);
    };
  };
  const m4: MiddlewareFunc = function() {
    return function(c) {
      c.response.status = 404;
    };
  };
  const m5: MiddlewareFunc = function() {
    return function(c) {
      c.response.status = 405;
    };
  };

  g.use(m1, m2, m3);
  g.get("/404", h, m4);
  g.get("/405", h, m5);
  app.start("0.0.0.0:8080");
  let res = await fetch("http://localhost:8080/group/404");
  assertEquals(res.status, Status.NotFound);
  res = await fetch("http://localhost:8080/group/405");
  assertEquals(res.status, Status.MethodNotAllowed);
  isFinished = true;
});

setInterval(() => {
  if (isFinished) {
    Deno.exit();
  }
}, 1000);
