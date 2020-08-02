import type { MiddlewareFunc, Renderer, HandlerFunc } from "./types.ts";
import type {
  Server,
  HTTPOptions,
  HTTPSOptions,
} from "./vendor/https/deno.land/std/http/server.ts";

import { serve, serveTLS } from "./vendor/https/deno.land/std/http/server.ts";
import { join } from "./vendor/https/deno.land/std/path/mod.ts";
import { Context } from "./context.ts";
import { Router } from "./router.ts";
import { Group } from "./group.ts";
import {
  InternalServerErrorException,
  HttpException,
  createHttpExceptionBody,
} from "./http_exception.ts";

export function NotImplemented(): Error {
  return new Error("Not Implemented");
}

export class Application {
  server: Server | undefined;
  renderer: Renderer | undefined;
  router = new Router();
  middleware: MiddlewareFunc[] = [];
  premiddleware: MiddlewareFunc[] = [];

  #process: Promise<void> | undefined;

  #start = async (s: Server): Promise<void> => {
    this.server = s;
    for await (const req of this.server) {
      const c = new Context({
        r: req,
        app: this,
      });
      let h: HandlerFunc;

      if (this.premiddleware.length === 0) {
        h = this.router.find(req.method, c);
        h = this.#applyMiddleware(h, ...this.middleware);
      } else {
        h = (c) => {
          h = this.router.find(req.method, c);
          h = this.#applyMiddleware(h, ...this.middleware);
          return h(c);
        };
        h = this.#applyMiddleware(h, ...this.premiddleware);
      }

      this.#transformResult(c, h).then((): void => {
        req.respond(c.response).catch(() => {});
      });
    }
  };

  #applyMiddleware = (h: HandlerFunc, ...m: MiddlewareFunc[]): HandlerFunc => {
    for (let i = m.length - 1; i >= 0; --i) {
      h = m[i](h);
    }

    return h;
  };

  /** `start` starts an HTTP server. */
  start(sc: HTTPOptions): void {
    this.#process = this.#start(serve(sc));
  }

  /** `startTLS` starts an HTTPS server. */
  startTLS(sc: HTTPSOptions): void {
    this.#process = this.#start(serveTLS(sc));
  }

  async close(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
    await this.#process;
  }
  /** `pre` adds middleware which is run before router. */
  pre(...m: MiddlewareFunc[]): Application {
    this.premiddleware.push(...m);
    return this;
  }

  /** `use` adds middleware which is run after router. */
  use(...m: MiddlewareFunc[]): Application {
    this.middleware.push(...m);
    return this;
  }
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    return this.add("TRACE", path, h, ...m);
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Application {
    const methods = [
      "CONNECT",
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
      "TRACE",
    ];
    for (const method of methods) {
      this.add(method, path, h, ...m);
    }
    return this;
  }
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): Application {
    for (const method of methods) {
      this.add(method, path, h, ...m);
    }
    return this;
  }
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): Application {
    this.router.add(method, path, (c: Context): unknown => {
      let h = handler;
      for (const m of middleware) {
        h = m(h);
      }
      return h(c);
    });
    return this;
  }

  /** `group` creates a new router group with prefix and optional group level middleware. */
  group(prefix: string, ...m: MiddlewareFunc[]): Group {
    const g = new Group({ app: this, prefix });
    g.use(...m);
    return g;
  }

  /** `static` registers a new route with path prefix to serve static files from the provided root directory. */
  static(prefix: string, root: string, ...m: MiddlewareFunc[]): Application {
    if (prefix[prefix.length - 1] === "/") {
      prefix = prefix.slice(0, prefix.length - 1);
    }
    const h: HandlerFunc = (c) => {
      const filepath = c.path.substr(prefix.length);
      return c.file(join(root, filepath));
    };
    return this.get(`${prefix}/*`, h, ...m);
  }

  /** `file` registers a new route with path to serve a static file with optional route-level middleware. */
  file(path: string, filepath: string, ...m: MiddlewareFunc[]): Application {
    return this.get(path, (c) => c.file(filepath), ...m);
  }

  #transformResult = async (c: Context, h: HandlerFunc): Promise<void> => {
    let result: unknown;
    try {
      result = await h(c);
    } catch (e) {
      if (e instanceof HttpException) {
        result = c.json(
          typeof e.response === "object"
            ? e.response
            : createHttpExceptionBody(e.response, undefined, e.status),
          e.status,
        );
      } else {
        console.log(e);
        e = new InternalServerErrorException(e.message);
        result = c.json(
          (e as InternalServerErrorException).response,
          (e as InternalServerErrorException).status,
        );
      }
    }
    if (c.response.status == undefined) {
      switch (typeof result) {
        case "object":
          if (result instanceof Uint8Array) {
            c.blob(result);
          } else {
            c.json(result as Record<string, unknown>);
          }
          break;
        case "string":
          /^\s*</.test(result) ? c.html(result) : c.string(result);
          break;
        default:
          c.string(String(result));
      }
    }
  };
}
