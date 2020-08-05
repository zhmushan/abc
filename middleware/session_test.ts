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
const skey = "abc.session";
const key = "answer";
const value = "42";

test("middleware session", function (): void {
  c.session = new Session(store, skey);
  c.session.init();
  c.session.set(key, value);
  assertEquals(c.session.get(key), value);
});

test("middleware session ID generator", function (): void {
  assertEquals(c.session.sessionID, skey);
  c.session = new Session(store);
  c.session.init();
  assert(c.session.sessionID.length == 64);
});

test("middleware session memory store", function (): void {
  assert(store.sessionExists(skey));
  assert(store.sessionExists(c.session.sessionID));

  c.session.set(key, value);
  assertEquals(store.getSession(c.session.sessionID), { [key]: value });
});
