import { Session, SessionMemoryStore } from "./session.ts";

import {
  assertEquals,
  assert,
} from "../vendor/https/deno.land/std/testing/asserts.ts";
import { createMockRequest } from "../test_util.ts";
import { Context } from "../context.ts";
const { test } = Deno;

const options = { app: undefined!, r: createMockRequest() };
const c = new Context(options);
const store = new SessionMemoryStore();

test("middleware session", function (): void {
  c.session = new Session(store, "sessionKey");
  c.setCookie(
      { name: "sessionKey", value: c.session.sessionID, path: "/" },
  );
  c.session.init();
  c.session.set("key", "value");
  assertEquals(c.session.get("key"), "value");
});
