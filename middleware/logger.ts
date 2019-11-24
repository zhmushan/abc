import { MiddlewareFunc, HandlerFunc, Context } from "../mod.ts";
import { Skipper, DefaultSkipper } from "./skipper.ts";

export enum LoggerFlag {
  Time = "#{time}",
  Method = "#{method}",
  Path = "#{path}"
}

export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  format: `time: '${LoggerFlag.Time}', method: '${LoggerFlag.Method}', path: '${LoggerFlag.Path}'`
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
      for (const key in LoggerFlag) {
        if (LoggerFlag[key] === LoggerFlag.Time) {
          outstr = outstr.replace(LoggerFlag.Time, new Date().toString());
        } else if (LoggerFlag[key] === LoggerFlag.Method) {
          outstr = outstr.replace(LoggerFlag.Method, c.method);
        } else if (LoggerFlag[key] === LoggerFlag.Path) {
          outstr = outstr.replace(LoggerFlag.Path, c.path);
        }
      }
      console.log(outstr);
      return next(c);
    };
  };
}

export interface LoggerConfig {
  skipper?: Skipper;
  format?: string;
}
