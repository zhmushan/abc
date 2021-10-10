import type { Context } from "../context.ts";

import {
  assert,
  assertEquals,
} from "../vendor/https/deno.land/std/testing/asserts.ts";
import { DefaultFormatter, logger } from "./logger.ts";
const { test, makeTempFileSync, readFileSync, openSync, removeSync } = Deno;

const dt = new Date();
const ctx = {
  method: "GET",
  path: "/",
} as Context;
const decoder = new TextDecoder();

test("middleware logger", function (): void {
  const fpath = makeTempFileSync();
  const f = openSync(fpath, { write: true });
  logger({
    output: f,
  })((c) => c)(ctx);
  const out = decoder.decode(readFileSync(fpath));
  assert(out.includes(" GET /\n"));
  assert(new Date(out.split(" ")[0]).getTime() >= dt.getTime());
  f.close();
  removeSync(fpath);
});

test("middleware logger default formatter", function (): void {
  const logInfo = DefaultFormatter(ctx);
  assert(logInfo.endsWith(" GET /\n"));
  assert(new Date(logInfo.split(" ")[0]).getTime() >= dt.getTime());
});

test("middleware logger custom formatter", function (): void {
  const fpath = makeTempFileSync();
  const f = openSync(fpath, { write: true });
  const info = "Hello, 你好！";
  logger({
    output: f,
    formatter: (): string => info,
  })((c) => c)(ctx);
  const out = decoder.decode(readFileSync(fpath));
  assertEquals(out, info);
  f.close();
  removeSync(fpath);
});
