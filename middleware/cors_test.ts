import { assertEquals, runIfMain } from "../dev_deps.ts";
import { cors } from "./cors.ts";
import { Header } from "../constants.ts";
import { IContext } from "../types.ts";
const { test } = Deno;

test(function MiddlewareCORS(): void {
  const headers = new Headers();
  const ctx = {
    request: {
      headers
    },
    response: {
      headers
    }
  } as IContext;
  cors()(c => c)(ctx);
  assertEquals(headers.get(Header.Vary), Header.Origin);
  assertEquals(headers.get(Header.AccessControlAllowOrigin), "*");
});

runIfMain(import.meta);
