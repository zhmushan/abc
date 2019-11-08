import { Skipper, DefaultSkipper } from "./skipper.ts";
import { MiddlewareFunc, HandlerFunc } from "../abc.ts";
import { Context } from "../context.ts";
import { HttpMethod } from "../http_method.ts";
import { Status } from "../deps.ts";

export const DefaultCORSConfig: CORSConfig = {
  skipper: DefaultSkipper,
  allowOrigins: ["*"],
  allowMethods: [
    HttpMethod.Delete,
    HttpMethod.Get,
    HttpMethod.Head,
    HttpMethod.Patch,
    HttpMethod.Post,
    HttpMethod.Put
  ]
};

export function cors(config = DefaultCORSConfig): MiddlewareFunc {
  if (config.skipper == null) {
    config.skipper = DefaultCORSConfig.skipper;
  }
  if (!config.allowOrigins || config.allowOrigins.length == 0) {
    config.allowOrigins = DefaultCORSConfig.allowOrigins;
  }
  if (!config.allowMethods || config.allowMethods.length == 0) {
    config.allowMethods = DefaultCORSConfig.allowMethods;
  }

  return function(next: HandlerFunc): HandlerFunc {
    return function(c: Context) {
      if (config.skipper(c)) {
        return next(c);
      }
      const req = c.request;
      const resp = c.response;
      const origin = req.headers.get("Origin");
      if (!resp.headers) resp.headers = new Headers();

      let allowOrigin = "";
      for (const o of config.allowOrigins) {
        if (o == "*" && config.allowCredentials) {
          allowOrigin = origin;
          break;
        }
        if (o == "*" || o == origin) {
          allowOrigin = o;
          break;
        }
        if (origin.startsWith(o)) {
          allowOrigin = origin;
          break;
        }
      }

      resp.headers.append("Vary", "Origin");
      if (config.allowCredentials) {
        resp.headers.set("Access-Control-Allow-Credentials", "true");
      }

      if (req.method != HttpMethod.Options) {
        resp.headers.set("Access-Control-Allow-Origin", allowOrigin);
        if (config.exposeHeaders && config.exposeHeaders.length != 0) {
          resp.headers.set(
            "Access-Control-Expose-Headers",
            config.exposeHeaders.join(",")
          );
        }

        return next(c);
      }
      resp.headers.append("Vary", "Access-Control-Allow-Methods");
      resp.headers.append("Vary", "Access-Control-Allow-Headers");
      resp.headers.set("Access-Control-Allow-Origin", allowOrigin);
      resp.headers.set(
        "Access-Control-Allow-Methods",
        config.allowMethods.join(",")
      );
      if (config.allowHeaders && config.allowHeaders.length != 0) {
        resp.headers.set(
          "Access-Control-Allow-Headers",
          config.allowHeaders.join(",")
        );
      } else {
        const h = req.headers.get("Access-Control-Allow-Headers");
        if (h) {
          resp.headers.set("Access-Control-Allow-Headers", h);
        }
      }
      if (config.maxAge > 0) {
        resp.headers.set("Access-Control-Max-Age", String(config.maxAge));
      }

      resp.status = Status.NoContent;
    };
  };
}

export interface CORSConfig {
  skipper?: Skipper;
  allowOrigins?: string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  maxAge?: number;
}
