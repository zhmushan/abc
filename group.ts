import type { HandlerFunc, MiddlewareFunc } from "./types.ts";
import type { Application } from "./app.ts";

import { join } from "./vendor/https/deno.land/std/path/mod.ts";

export class Group {
  prefix: string;
  middleware: MiddlewareFunc[];
  app: Application;

  #willBeAdded: Array<
    [method: string, path: string, h: HandlerFunc, m: MiddlewareFunc[]]
  >;

  constructor(opts: { app: Application; prefix: string }) {
    this.prefix = opts.prefix || "";
    this.app = opts.app || ({} as Application);

    this.middleware = [];
    this.#willBeAdded = [];
  }

  use(...m: MiddlewareFunc[]): Group {
    this.middleware.push(...m);
    return this;
  }

  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["CONNECT", path, h, m]);
    return this;
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["DELETE", path, h, m]);
    return this;
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["GET", path, h, m]);
    return this;
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["HEAD", path, h, m]);
    return this;
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["OPTIONS", path, h, m]);
    return this;
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["PATCH", path, h, m]);
    return this;
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["POST", path, h, m]);
    return this;
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["PUT", path, h, m]);
    return this;
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    this.#willBeAdded.push(["TRACE", path, h, m]);
    return this;
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
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
      this.#willBeAdded.push([method, path, h, m]);
    }
    return this;
  }
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): Group {
    for (const method of methods) {
      this.#willBeAdded.push([method, path, h, m]);
    }
    return this;
  }
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): Group {
    this.#willBeAdded.push([method, path, handler, middleware]);
    return this;
  }

  static(prefix: string, root: string): Group {
    this.app.static(join(this.prefix, prefix), root);
    return this;
  }

  file(p: string, filepath: string, ...m: MiddlewareFunc[]): Group {
    this.app.file(join(this.prefix, p), filepath, ...m);
    return this;
  }

  group(prefix: string, ...m: MiddlewareFunc[]): Group {
    const g = this.app.group(this.prefix + prefix, ...this.middleware, ...m);
    return g;
  }

  θapplyMiddleware(): void {
    for (const [method, path, handler, middleware] of this.#willBeAdded) {
      this.app.add(
        method,
        this.prefix + path,
        handler,
        ...this.middleware,
        ...middleware,
      );
    }
    this.#willBeAdded = [];
  }
}
