import type { Context } from "../context.ts";

import { assertEquals } from "../vendor/https/deno.land/std/testing/asserts.ts";
import { cors } from "./cors.ts";
import { Header } from "../constants.ts";
const { test } = Deno;

test("middleware cors", function (): void {
  let headers = new Headers();
  let ctx = {
    request: {
      headers: new Headers(),
    },
    response: {
      headers,
    },
  } as Context;
  cors()((c) => c)(ctx);
  assertEquals(headers.get(Header.Vary), Header.Origin);
  assertEquals(headers.get(Header.AccessControlAllowOrigin), "*");

  headers = new Headers();
  ctx = {
    request: {
      headers: new Headers(),
    },
    response: {
      headers,
    },
  } as Context;
  cors({
    allowOrigins: ["http://foo.com", "http://bar.com"],
  })((c) => c)(ctx);
  assertEquals(headers.get(Header.AccessControlAllowOrigin), null);

  headers = new Headers();
  ctx = {
    request: {
      headers: new Headers({ [Header.Origin]: "http://bar.com" }),
    },
    response: {
      headers,
    },
  } as Context;
  cors({
    allowOrigins: ["http://foo.com", "http://bar.com"],
  })((c) => c)(ctx);
  assertEquals(headers.get(Header.AccessControlAllowOrigin), "http://bar.com");

  headers = new Headers();
  ctx = {
    request: {
      headers: new Headers({ [Header.Origin]: "http://bar.com/xyz/" }),
    },
    response: {
      headers,
    },
  } as Context;
  cors({
    allowOrigins: ["http://foo.com", "http://bar.com"],
  })((c) => c)(ctx);
  assertEquals(
    headers.get(Header.AccessControlAllowOrigin),
    "http://bar.com/xyz/",
  );
});
