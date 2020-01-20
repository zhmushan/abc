import { Abc, MiddlewareFunc, HandlerFunc, NotFoundHandler } from "./abc.ts";
import { path } from "./deps.ts";

export class Group {
  prefix: string;
  middleware: MiddlewareFunc[];
  abc: Abc;

  constructor(options: GroupOptions) {
    this.prefix = options.prefix || "";
    this.abc = options.abc || ({} as Abc);

    this.middleware = [];
  }

  use(...m: MiddlewareFunc[]): Group {
    this.middleware.push(...m);
    if (this.middleware.length !== 0) {
      this.any("", NotFoundHandler);
    }
    return this;
  }

  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("CONNECT", path, h, ...m);
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("DELETE", path, h, ...m);
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("GET", path, h, ...m);
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("HEAD", path, h, ...m);
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("OPTIONS", path, h, ...m);
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("PATCH", path, h, ...m);
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("POST", path, h, ...m);
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("PUT", path, h, ...m);
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group {
    return this.add("TRACE", path, h, ...m);
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
  ): Group {
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
  ): Group {
    this.abc.add(
      method,
      this.prefix + path,
      handler,
      ...this.middleware,
      ...middleware
    );
    return this;
  }

  static(prefix: string, root: string): Group {
    this.abc.static(path.join(this.prefix, prefix), root);
    return this;
  }

  file(p: string, filepath: string, ...m: MiddlewareFunc[]): Group {
    this.abc.file(path.join(this.prefix, p), filepath, ...m);
    return this;
  }

  group(prefix: string, ...m: MiddlewareFunc[]): Group {
    const g = this.abc.group(this.prefix + prefix, ...this.middleware, ...m);
    return g;
  }
}

export interface GroupOptions {
  abc: Abc;
  prefix: string;
}

export function group(options: GroupOptions = {} as GroupOptions): Group {
  const g = new Group(options);
  return g;
}
