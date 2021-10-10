import type { MiddlewareFunc } from "../types.ts";
import type { Context } from "../context.ts";
import type { Skipper } from "./skipper.ts";

import { DefaultSkipper } from "./skipper.ts";
const { writeSync, stdout } = Deno;

export type Formatter = (c: Context) => string;

const encoder = new TextEncoder();

export const DefaultFormatter: Formatter = ({ method, path }) => {
  return `${new Date().toISOString()} ${method} ${path}\n`;
};

export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  formatter: DefaultFormatter,
  output: stdout,
};

export function logger(
  config: LoggerConfig = DefaultLoggerConfig,
): MiddlewareFunc {
  if (config.formatter == null) {
    config.formatter = DefaultLoggerConfig.formatter;
  }
  if (config.skipper == null) {
    config.skipper = DefaultLoggerConfig.skipper;
  }
  if (config.output == null) {
    config.output = stdout;
  }
  return (next) =>
    (c) => {
      if (config.skipper!(c)) {
        return next(c);
      }
      writeSync(config.output!.rid, encoder.encode(config.formatter!(c)));
      return next(c);
    };
}

export interface LoggerConfig {
  skipper?: Skipper;
  formatter?: Formatter;

  // Default is Deno.stdout.
  output?: { rid: number };
}
