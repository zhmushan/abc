import type { Context } from "../context.ts";

import { assertEquals, assert, runIfMain } from "../dev_deps.ts";
import { DefaultFormatter, logger } from "./logger.ts";
const { test } = Deno;

const dt = new Date();
const ctx = {
  request: {
    method: "GET",
    url: "",
    proto: "HTTP/1.1"
  }
} as Context;
const decoder = new TextDecoder();

class Writer implements Deno.Writer {
  out = "";
  async write(p: Uint8Array): Promise<number> {
    this.out = decoder.decode(p);
    return 0;
  }
}

test(function MiddlewareLogger(): void {
  const w = new Writer();
  logger({
    output: w
  })(c => c)(ctx);
  assert(w.out.endsWith(" GET / HTTP/1.1\n"));
  assert(new Date(w.out.split(" ")[0]).getTime() >= dt.getTime());
});

test(function MiddlewareLoggerDefaultFormatter(): void {
  const logInfo = DefaultFormatter(ctx);
  assert(logInfo.endsWith(" GET / HTTP/1.1\n"));
  assert(new Date(logInfo.split(" ")[0]).getTime() >= dt.getTime());
});

test(function MiddlewareLoggerCustomFormatter(): void {
  const info = "Hello, 你好！";
  const w = new Writer();
  logger({
    output: w,
    formatter: (): string => info
  })(c => c)(ctx);
  assertEquals(w.out, info);
});

runIfMain(import.meta);
