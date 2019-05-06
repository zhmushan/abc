import { Abc, MiddlewareFunc, HandlerFunc } from "./abc.ts";

export interface Group {
  prefix: string;
  middleware: MiddlewareFunc[];
  abc: Abc;

  use(...m: MiddlewareFunc[]): Group;
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): Group;
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): Group;
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): Group;
  static(path: string): Group;
  group(prefix: string, ...m: MiddlewareFunc[]): Group;
}

class GroupImpl implements Group {
  prefix: string;
  middleware: MiddlewareFunc[];
  abc: Abc;

  constructor(options: GroupOptions) {
    this.prefix = options.prefix || "";
    this.abc = options.abc || ({} as Abc);
  }

  use(...m: MiddlewareFunc[]) {
    return this;
  }

  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]) {
    return this;
  }
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ) {
    return this;
  }
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ) {
    return this;
  }

  static(path: string) {
    this.abc.static(this.prefix + path);
    return this;
  }

  group(prefix: string, ...m: MiddlewareFunc[]) {
    const g = this.abc.group(this.prefix + prefix, ...this.middleware, ...m);
    return g;
  }
}

export interface GroupOptions {
  abc: Abc;
  prefix: string;
}

export function group(options = {} as GroupOptions) {
  const g = new GroupImpl(options) as Group;
  return g;
}
