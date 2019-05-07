import { serve, Status, STATUS_TEXT } from "./deps.ts";
import { Context, context } from "./context.ts";
import { Router } from "./router.ts";
import { Binder, binder } from "./binder.ts";
import { group, Group } from "./group.ts";
const { cwd, stat, readFile } = Deno;

/** `Renderer` is the interface that wraps the `render` function.  */
export interface Renderer {
  templates?: string;
  render<T>(name: string, data: T): Promise<Deno.Reader>;
}

/* `HandlerFunc` defines a function to serve HTTP requests. */
export type HandlerFunc = (c?: Context) => Promise<any> | any;

/* `MiddlewareFunc` defines a function to process middleware. */
export type MiddlewareFunc = (h: HandlerFunc) => HandlerFunc;

export interface Abc {
  router: Router;
  middleware: MiddlewareFunc[];
  premiddleware: MiddlewareFunc[];
  binder: Binder;
  renderer: Renderer;

  /** `start` starts an HTTP server. */
  start(addr: string): Promise<void>;

  /** `pre` adds middleware which is run before router. */
  pre(...m: MiddlewareFunc[]): Abc;

  /** `use` adds middleware which is run after router. */
  use(...m: MiddlewareFunc[]): Abc;

  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Abc;
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): Abc;
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): Abc;

  /** `static` registers a new route to serve static files from the provided root path. */
  static(path: string): Abc;

  /** `group` creates a new router group with prefix and optional group level middleware. */
  group(prefix: string, ...m: MiddlewareFunc[]): Group;
}

class AbcImpl implements Abc {
  router: Router;
  middleware: MiddlewareFunc[];
  premiddleware: MiddlewareFunc[];
  binder: Binder;
  renderer: Renderer;

  constructor() {
    this.router = new Router();
    this.middleware = [];
    this.premiddleware = [];
    this.binder = binder();
  }

  async start(addr: string) {
    const s = serve(addr);

    for await (const req of s) {
      const c = context({ r: req, url: new URL(req.url, addr), abc: this });
      let h = this.router.find(req.method, c) || NotFoundHandler;

      if (this.premiddleware.length) {
        h = c => {
          for (let i = this.middleware.length - 1; i >= 0; i--) {
            h = this.middleware[i](h);
          }
          return h(c);
        };
        for (let i = this.premiddleware.length - 1; i >= 0; i--) {
          h = this.premiddleware[i](h);
        }
      } else {
        for (let i = this.middleware.length - 1; i >= 0; i--) {
          h = this.middleware[i](h);
        }
      }
      this.transformResult(c, await h(c));

      await req.respond(c.response);
    }
  }

  pre(...m: MiddlewareFunc[]) {
    this.premiddleware.push(...m);
    return this;
  }
  use(...m: MiddlewareFunc[]) {
    this.middleware.push(...m);
    return this;
  }
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this.add("TRACE", path, h, ...m);
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
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
  ) {
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
  ) {
    this.router.add(method, path, c => {
      let h = handler;
      for (const m of middleware) {
        h = m(h);
      }
      return h(c);
    });
    return this;
  }
  group(prefix: string, ...m: MiddlewareFunc[]) {
    const g = group({ abc: this, prefix });
    return g;
  }
  static(path: string) {
    const h: HandlerFunc = async c => {
      let filepath = cwd() + c.path;
      const fileinfo = await stat(filepath);
      let resp: string;
      try {
        if (
          fileinfo.isDirectory() &&
          (await stat(filepath + "index.html")).isFile()
        ) {
          filepath += "index.html";
        }
        resp = new TextDecoder().decode(await readFile(filepath));
      } catch {}

      return resp;
    };
    return this.get(path, h);
  }
  private transformResult(c: Context, result: any) {
    if (c.response.status == undefined) {
      switch (typeof result) {
        case "object":
          c.json(result);
          break;
        case "string":
          /^\s*</.test(result) ? c.html(result) : c.string(result);
          break;
        default:
          c.string(result);
      }
    }
  }
}

export const NotFoundHandler: HandlerFunc = c => {
  c.response.status = Status.NotFound;
  c.response.body = new TextEncoder().encode(STATUS_TEXT.get(Status.NotFound));
};
export const InternalServerErrorHandler: HandlerFunc = c => {
  c.response.status = Status.InternalServerError;
  c.response.body = new TextEncoder().encode(
    STATUS_TEXT.get(Status.InternalServerError)
  );
};
export function NotImplemented() {
  return new Error("Not Implemented");
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
 *      .start("0.0.0.0:8080");
 */
export function abc() {
  const abc = new AbcImpl() as Abc;
  return abc;
}

export class HttpError extends Error {
  code: number;
  constructor(code: number, message?: any) {
    if (!message) {
      message = Status[code];
    }
    console.log(message);
    super(message);
    this.code = code;
  }
}
