import { MiddlewareFunc, HandlerFunc } from "../abc.ts";
import { Context } from "../context.ts";
import { Skipper, DefaultSkipper } from "./skipper.ts";

export type Formatter = (c: Context) => string;

const encoder = new TextEncoder();

export const DefaultFormatter: Formatter = (c: Context): string => {
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
  return function(next: HandlerFunc): HandlerFunc {
    return function(c: Context): unknown {
      if (config.skipper(c)) {
        return next(c);
      }
      config.output.write(encoder.encode(config.formatter(c)));
      return next(c);
    };
  };
}

export interface LoggerConfig {
  skipper?: Skipper;
  formatter?: Formatter;

  // Default is Deno.stdout.
  output?: Deno.Writer;
}
