import { NotFoundHandler } from "./app.ts";
import { path } from "./deps.ts";
import { MiddlewareFunc, HandlerFunc, IApplication, IGroup } from "./types.ts";

export default class implements IGroup {
  prefix: string;
  middleware: MiddlewareFunc[];
  app: IApplication;

  constructor(opts: { app: IApplication; prefix: string }) {
    this.prefix = opts.prefix || "";
    this.app = opts.app || ({} as IApplication);

    this.middleware = [];
  }

  use(...m: MiddlewareFunc[]): IGroup {
    this.middleware.push(...m);
    if (this.middleware.length !== 0) {
      this.any("", NotFoundHandler);
    }
    return this;
  }

  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
    return this.add("TRACE", path, h, ...m);
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup {
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
  ): IGroup {
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
  ): IGroup {
    this.app.add(
      method,
      this.prefix + path,
      handler,
      ...this.middleware,
      ...middleware
    );
    return this;
  }

  static(prefix: string, root: string): IGroup {
    this.app.static(path.join(this.prefix, prefix), root);
    return this;
  }

  file(p: string, filepath: string, ...m: MiddlewareFunc[]): IGroup {
    this.app.file(path.join(this.prefix, p), filepath, ...m);
    return this;
  }

  group(prefix: string, ...m: MiddlewareFunc[]): IGroup {
    const g = this.app.group(this.prefix + prefix, ...this.middleware, ...m);
    return g;
  }
}
