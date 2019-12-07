import { MiddlewareFunc, HandlerFunc } from "../abc.ts";
import { Context } from "../context.ts";
import { Skipper, DefaultSkipper } from "./skipper.ts";

export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  format: ``
};

export function logger(config = DefaultLoggerConfig): MiddlewareFunc {
  if (config.format == null) {
    config.format = DefaultLoggerConfig.format;
  }
  if (config.skipper == null) {
    config.skipper = DefaultLoggerConfig.skipper;
  }
  return function(next: HandlerFunc): HandlerFunc {
    return function(c: Context) {
      if (config.skipper(c)) {
        return next(c);
      }
      let outstr = config.format;
      console.log(outstr);
      return next(c);
    };
  };
}

export interface LoggerConfig {
  skipper?: Skipper;
  format?: string;
}
