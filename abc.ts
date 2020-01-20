import { serve, path, Server } from "./deps.ts";
import { Context, context } from "./context.ts";
import { Router } from "./router.ts";
import { group, Group } from "./group.ts";
import {
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  createHttpExceptionBody
} from "./http_exception.ts";

/** `Renderer` is the interface that wraps the `render` function.  */
export interface Renderer {
  templates?: string;
  render<T>(name: string, data: T): Promise<Deno.Reader>;
}

/* `HandlerFunc` defines a function to serve HTTP requests. */
export type HandlerFunc = (c: Context) => Promise<unknown> | unknown;

/* `MiddlewareFunc` defines a function to process middleware. */
export type MiddlewareFunc = (h: HandlerFunc) => HandlerFunc;

interface ServerConfig {
  port: number;
  hostname?: string;
}

export function NotFoundHandler(): never {
  throw new NotFoundException();
}

export function NotImplemented(): Error {
  return new Error("Not Implemented");
}

export class Abc {
  router: Router;
  middleware: MiddlewareFunc[];
  premiddleware: MiddlewareFunc[];
  renderer: Renderer;
  server: Server;

  constructor() {
    this.router = new Router();
    this.middleware = [];
    this.premiddleware = [];
  }

  /** `start` starts an HTTP server. */
  async start(addr: string | ServerConfig): Promise<void> {
    if (typeof addr === "string") {
      const [hostname, port] = addr.split(":");
      addr = { hostname, port: Number(port) };
    }
    const s = serve(addr);
    this.server = s;

    for await (const req of s) {
      const c = context({
        r: req,
        url: new URL(
          req.url,
          `http://${addr.hostname ?? "0.0.0.0"}:${addr.port}`
        ),
        abc: this
      });
      let h = this.router.find(req.method, c) || NotFoundHandler;

      for (let i = this.middleware.length - 1; i >= 0; --i) {
        h = this.middleware[i](h);
      }
      for (let i = this.premiddleware.length - 1; i >= 0; --i) {
        h = this.premiddleware[i](h);
      }

      this.transformResult(c, h).then(() => {
        req.respond(c.response);
      });
    }
  }

  close(): void {
    this.server.listener.close();
  }

  /** `pre` adds middleware which is run before router. */
  pre(...m: MiddlewareFunc[]): Abc {
    this.premiddleware.push(...m);
    return this;
  }

  /** `use` adds middleware which is run after router. */
  use(...m: MiddlewareFunc[]): Abc {
    this.middleware.push(...m);
    return this;
  }
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    return this.add("TRACE", path, h, ...m);
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc {
    const methods = [
      "CONNECT",
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
      "TRACE"
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
  ): Abc {
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
  ): Abc {
    this.router.add(method, path, (c: Context) => {
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
    const g = group({ abc: this, prefix });
    g.use(...m);
    return g;
  }

  /** `static` registers a new route with path prefix to serve static files from the provided root directory. */
  static(prefix: string, root: string): Abc {
    const h = function(c: Context): Promise<string> {
      const filepath: string = c.params.filepath;
      return c.file(path.join(root, filepath));
    };
    if (prefix === "/") {
      return this.get(`${prefix}*filepath`, h);
    }
    return this.get(`${prefix}/*filepath`, h);
  }

  /** `file` registers a new route with path to serve a static file with optional route-level middleware. */
  file(path: string, filepath: string, ...m: MiddlewareFunc[]): Abc {
    return this.get(path, (c: Context) => c.file(filepath), ...m);
  }

  private async transformResult(c: Context, h: HandlerFunc): Promise<void> {
    let result: unknown;
    try {
      result = await h(c);
    } catch (e) {
      if (e instanceof HttpException) {
        result = c.json(
          typeof e.response === "object"
            ? e.response
            : createHttpExceptionBody(e.response, undefined, e.status),
          e.status
        );
      } else {
        e = new InternalServerErrorException(e.message);
        result = c.json(
          (e as InternalServerErrorException).response,
          (e as InternalServerErrorException).status
        );
      }
    }
    if (c.response.status == undefined) {
      switch (typeof result) {
        case "object":
          c.json(result);
          break;
        case "string":
          /^\s*</.test(result) ? c.html(result) : c.string(result);
          break;
        default:
          c.string(String(result));
      }
    }
  }
}

/**
 * `abc` creates an instance of `Abc`.
 *
 * Example:
 *
 *    const app = abc();
 *    app
 *      .get("/hello", c => {
 *        return "Hello, Abc!";
 *      })
 *      .start({ port: 8080 });
 */
export function abc(): Abc {
  const abc = new Abc();
  return abc;
}
