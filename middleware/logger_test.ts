import { test, assertEquals, assert } from "../dev_deps.ts";
import { DefaultFormatter, logger } from "./logger.ts";
import { Context } from "../context.ts";

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
  out: null | string;
  async write(p: Uint8Array) {
    this.out = decoder.decode(p);
    return 0;
  }
}

test(function MiddlewareLogger() {
  const w = new Writer();
  logger({
    output: w
  })(c => c)(ctx);
  assert(w.out.endsWith(" GET / HTTP/1.1\n"));
  assert(new Date(w.out.split(" ")[0]).getTime() >= dt.getTime());
});

test(function MiddlewareLoggerDefaultFormatter() {
  const logInfo = DefaultFormatter(ctx);
  assert(logInfo.endsWith(" GET / HTTP/1.1\n"));
  assert(new Date(logInfo.split(" ")[0]).getTime() >= dt.getTime());
});

test(function MiddlewareLoggerCustomFormatter() {
  const info = "Hello, 你好！";
  const w = new Writer();
  logger({
    output: w,
    formatter: () => info
  })(c => c)(ctx);
  assertEquals(w.out, info);
});
