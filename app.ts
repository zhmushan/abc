import { serve, path, Server, HTTPOptions, HTTPSOptions } from "./deps.ts";
import Context from "./context.ts";
import Router from "./router.ts";
import Group from "./group.ts";
import {
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  createHttpExceptionBody
} from "./http_exception.ts";
import {
  MiddlewareFunc,
  Renderer,
  HandlerFunc,
  IContext,
  IApplication,
  IRouter,
  IGroup
} from "./types.ts";
import { serveTLS } from "https://deno.land/std@v0.35.0/http/server.ts";
export function NotFoundHandler(): never {
  throw new NotFoundException();
}

export function NotImplemented(): Error {
  return new Error("Not Implemented");
}

export default class implements IApplication {
  server: Server | undefined;
  renderer: Renderer | undefined;
  router: IRouter = new Router();
  middleware: MiddlewareFunc[] = [];
  premiddleware: MiddlewareFunc[] = [];

  #start = async (): Promise<void> => {
    for await (const req of this.server!) {
      const c = new Context({
        r: req,
        app: this
      });
      let h = this.router.find(req.method, c) || NotFoundHandler;

      for (let i = this.middleware.length - 1; i >= 0; --i) {
        h = this.middleware[i](h);
      }
      for (let i = this.premiddleware.length - 1; i >= 0; --i) {
        h = this.premiddleware[i](h);
      }

      this.transformResult(c, h).then((): void => {
        req.respond(c.response);
      });
    }
  };

  start(sc: HTTPOptions): void {
    this.server = serve(sc);
    this.#start();
  }

  startTLS(sc: HTTPSOptions): void {
    this.server = serveTLS(sc);
    this.#start();
  }

  close(): void {
    if (this.server) {
      this.server.close();
    }
  }

  pre(...m: MiddlewareFunc[]): IApplication {
    this.premiddleware.push(...m);
    return this;
  }

  use(...m: MiddlewareFunc[]): IApplication {
    this.middleware.push(...m);
    return this;
  }
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
    return this.add("TRACE", path, h, ...m);
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication {
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
  ): IApplication {
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
  ): IApplication {
    this.router.add(method, path, (c: IContext): unknown => {
      let h = handler;
      for (const m of middleware) {
        h = m(h);
      }
      return h(c);
    });
    return this;
  }

  /** `group` creates a new router group with prefix and optional group level middleware. */
  group(prefix: string, ...m: MiddlewareFunc[]): IGroup {
    const g = new Group({ app: this, prefix });
    g.use(...m);
    return g;
  }

  /** `static` registers a new route with path prefix to serve static files from the provided root directory. */
  static(prefix: string, root: string): IApplication {
    const h: HandlerFunc = c => {
      const filepath: string = c.params.filepath;
      return c.file(path.join(root, filepath));
    };
    if (prefix === "/") {
      return this.get(`${prefix}*filepath`, h);
    }
    return this.get(`${prefix}/*filepath`, h);
  }

  /** `file` registers a new route with path to serve a static file with optional route-level middleware. */
  file(path: string, filepath: string, ...m: MiddlewareFunc[]): IApplication {
    return this.get(path, c => c.file(filepath), ...m);
  }

  private async transformResult(c: IContext, h: HandlerFunc): Promise<void> {
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
          c.json(result as Record<string, unknown>);
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
