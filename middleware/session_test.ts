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
const testSessionID = "2y315b4j5s5e535r4d0e4e4d2l5n2x1m2146672o1o2t1j4c4w445e1t3k4s4p12";
const key = "answer";
const value = "42";

test("middleware session", function (): void {
  c.session = new Session(store, testSessionID);
  c.session.init();
  c.session.set(key, value);
  assertEquals(c.session.get(key), value);
});

test("middleware session ID generator", function (): void {
  assertEquals(c.session.sessionID, testSessionID);
  c.session = new Session(store);
  c.session.init();
  assert(/[a-z0-9]{64}/.test(c.session.sessionID));
});

test("middleware session memory store", function (): void {
  assert(store.sessionExists(testSessionID));
  assert(store.sessionExists(c.session.sessionID));

  c.session.set(key, value);
  assertEquals(store.getSession(c.session.sessionID), { [key]: value });
});
