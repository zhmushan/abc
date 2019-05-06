import { Abc, middlewareFunc, handlerFunc } from "./abc.ts";

export interface Group {
  prefix: string;
  middleware: middlewareFunc[];
  abc: Abc;

  use(...m: middlewareFunc[]): Group;
  connect(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  delete(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  get(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  head(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  options(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  patch(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  post(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  put(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  trace(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  any(path: string, h: handlerFunc, ...m: middlewareFunc[]): Group;
  match(
    methods: string[],
    path: string,
    h: handlerFunc,
    ...m: middlewareFunc[]
  ): Group;
  add(
    method: string,
    path: string,
    handler: handlerFunc,
    ...middleware: middlewareFunc[]
  ): Group;
  static(path: string): Group;
  group(prefix: string, ...m: middlewareFunc[]): Group;
}

class GroupImpl implements Group {
  prefix: string;
  middleware: middlewareFunc[];
  abc: Abc;

  constructor(options: GroupOptions) {
    this.prefix = options.prefix || "";
    this.abc = options.abc || ({} as Abc);
  }

  use(...m: middlewareFunc[]) {
    return this;
  }

  connect(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  delete(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  get(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  head(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  options(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  patch(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  post(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  put(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  trace(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  any(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this;
  }
  match(
    methods: string[],
    path: string,
    h: handlerFunc,
    ...m: middlewareFunc[]
  ) {
    return this;
  }
  add(
    method: string,
    path: string,
    handler: handlerFunc,
    ...middleware: middlewareFunc[]
  ) {
    return this;
  }

  static(path: string) {
    this.abc.static(this.prefix + path);
    return this;
  }

  group(prefix: string, ...m: middlewareFunc[]) {
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
