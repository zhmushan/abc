import { test, assertEquals, runIfMain } from "../dev_deps.ts";
import { cors } from "./cors.ts";
import { Context } from "../context.ts";
import { Header } from "../constants.ts";

test(function MiddlewareCORS(): void {
  const headers = new Headers();
  const ctx = {
    request: {
      headers
    },
    response: {
      headers
    }
  } as Context;
  cors()((c: Context): Context => c)(ctx);

  assertEquals(headers.get(Header.Vary), Header.Origin);
  assertEquals(headers.get(Header.AccessControlAllowOrigin), "*");
});

runIfMain(import.meta);
