import { middlewareFunc, handlerFunc, Context } from "../mod.ts";

export enum LoggerFlag {
  Time = "#{time}",
  Method = "#{method}",
  Path = "#{path}"
}

export function logger(config = DefaultLoggerConfig): middlewareFunc {
  return function(next: handlerFunc): handlerFunc {
    return function(c: Context) {
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
  format: string;
}

export const DefaultLoggerConfig: LoggerConfig = {
  format: `time: '${LoggerFlag.Time}', method: '${LoggerFlag.Method}', path: '${
    LoggerFlag.Path
  }'`
};
