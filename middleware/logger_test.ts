import type { Context } from "../context.ts";

import { assertEquals, assert, runIfMain } from "../dev_deps.ts";
import { DefaultFormatter, logger } from "./logger.ts";
const { test, makeTempFileSync, readFileSync, openSync, removeSync } = Deno;

const dt = new Date();
const ctx = {
  request: {
    method: "GET",
    url: "",
    proto: "HTTP/1.1",
  },
} as Context;
const decoder = new TextDecoder();

test("middleware logger", function (): void {
  const fpath = makeTempFileSync();
  const f = openSync(fpath, { write: true });
  logger({
    output: f,
  })((c) => c)(ctx);
  const out = decoder.decode(readFileSync(fpath));
  assert(out.includes(" GET / HTTP/1.1\n"));
  assert(new Date(out.split(" ")[0]).getTime() >= dt.getTime());
  f.close();
  removeSync(fpath);
});

test("middleware logger default formatter", function (): void {
  const logInfo = DefaultFormatter(ctx);
  assert(logInfo.endsWith(" GET / HTTP/1.1\n"));
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

runIfMain(import.meta);
