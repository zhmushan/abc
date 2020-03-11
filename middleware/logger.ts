// TODO: waiting for denoland/deno#4297
// import type { MiddlewareFunc } from "../types.ts";
// import type { Context } from "../context.ts";
// import type { Skipper } from "./skipper.ts";

import { MiddlewareFunc } from "../types.ts";
import { Context } from "../context.ts";
import { Skipper } from "./skipper.ts";

import { DefaultSkipper } from "./skipper.ts";

export type Formatter = (c: Context) => string;

const encoder = new TextEncoder();

export const DefaultFormatter: Formatter = c => {
  const req = c.request;

  const time = new Date().toISOString();
  const method = req.method;
  const url = req.url || "/";
  const protocol = c.request.proto;

  return `${time} ${method} ${url} ${protocol}\n`;
};

export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  formatter: DefaultFormatter,
  output: Deno.stdout
};

export function logger(
  config: LoggerConfig = DefaultLoggerConfig
): MiddlewareFunc {
  if (config.formatter == null) {
    config.formatter = DefaultLoggerConfig.formatter;
  }
  if (config.skipper == null) {
    config.skipper = DefaultLoggerConfig.skipper;
  }
  if (config.output == null) {
    config.output = Deno.stdout;
  }
  return next =>
    c => {
      if (config.skipper!(c)) {
        return next(c);
      }
      config.output!.write(encoder.encode(config.formatter!(c)));
      return next(c);
    };
}

export interface LoggerConfig {
  skipper?: Skipper;
  formatter?: Formatter;

  // Default is Deno.stdout.
  output?: Deno.Writer;
}
