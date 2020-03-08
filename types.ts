import {
  ServerRequest,
  Response,
  Status,
  Server,
  HTTPOptions
} from "./deps.ts";
import { NodeType } from "./node.ts";

export interface IApplication {
  router: IRouter;
  middleware: MiddlewareFunc[];
  premiddleware: MiddlewareFunc[];
  renderer: Renderer | undefined;
  server: Server | undefined;
  /** `start` starts an HTTP server. */
  start(sc: HTTPOptions): Promise<void>;
  close(): void;
  /** `pre` adds middleware which is run before router. */
  pre(...m: MiddlewareFunc[]): IApplication;
  /** `use` adds middleware which is run after router. */
  use(...m: MiddlewareFunc[]): IApplication;
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IApplication;
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): IApplication;
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): IApplication;
  group(prefix: string, ...m: MiddlewareFunc[]): IGroup;
  static(prefix: string, root: string): IApplication;
  file(path: string, filepath: string, ...m: MiddlewareFunc[]): IApplication;
}

export interface IGroup {
  app: IApplication;
  prefix: string;
  middleware: MiddlewareFunc[];
  use(...m: MiddlewareFunc[]): IGroup;
  connect(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  delete(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  get(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  head(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  options(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  patch(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  post(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  put(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  trace(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  any(path: string, h: HandlerFunc, ...m: MiddlewareFunc[]): IGroup;
  match(
    methods: string[],
    path: string,
    h: HandlerFunc,
    ...m: MiddlewareFunc[]
  ): IGroup;
  add(
    method: string,
    path: string,
    handler: HandlerFunc,
    ...middleware: MiddlewareFunc[]
  ): IGroup;
  static(prefix: string, root: string): IGroup;
  file(p: string, filepath: string, ...m: MiddlewareFunc[]): IGroup;
  group(prefix: string, ...m: MiddlewareFunc[]): IGroup;
}

export interface IContext {
  app: IApplication;
  request: ServerRequest;
  response: Response;
  path: string;
  method: string;
  queryParams: URLSearchParams;
  params: Record<string, string>;
  body(): Promise<Record<string, unknown>>;
  string(v: string, code?: Status): void;
  json(v: Record<string, any> | string, code?: Status): void;
  /** Sends an HTTP response with status code. */
  html(v: string, code?: Status): void;
  /** Sends an HTTP blob response with status code. */
  htmlBlob(b: Uint8Array | Deno.Reader, code?: Status): void;
  /**
   * Renders a template with data and sends a text/html response with status code.
   * Abc.renderer must be registered first.
   */
  render<T>(name: string, data: T, code?: Status): Promise<void>;
  /** Sends a blob response with content type and status code. */
  blob(b: Uint8Array | Deno.Reader, contentType: string, code?: Status): void;
  file(filepath: string): Promise<string>;
}

export interface IRouter {
  trees: Record<string, INode>;
  add(method: string, path: string, h: HandlerFunc): void;
  find(method: string, c: IContext): HandlerFunc | undefined;
}

export interface INode {
  priority: number;
  children: INode[];
  path: string;
  wildChild: boolean;
  nType: NodeType;
  indices: string;
  handle: HandlerFunc | undefined;
  maxParams: number;
  addRoute(path: string, handle: HandlerFunc): void;
  incrementChildPrio(pos: number): number;
  insertChild(
    numParams: number,
    path: string,
    fullPath: string,
    handle: HandlerFunc
  ): void;
  getValue(
    path: string
  ): [HandlerFunc | undefined, Params | undefined, boolean];
}

/** `Renderer` is the interface that wraps the `render` function.  */
export type Renderer = {
  templates?: string;
  render<T>(name: string, data: T): Promise<Deno.Reader>;
};

/* `HandlerFunc` defines a function to serve HTTP requests. */
export type HandlerFunc = (c: IContext) => Promise<unknown> | unknown;

/* `MiddlewareFunc` defines a function to process middleware. */
export type MiddlewareFunc = (h: HandlerFunc) => HandlerFunc;

export type Param = {
  key: string;
  value: string;
};

export type Params = Param[];
