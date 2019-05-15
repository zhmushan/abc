import { ServerRequest, Response, Status } from "./deps.ts";
import { Abc } from "./abc.ts";
import { bind } from "./binder.ts";
import { Type } from "./type.ts";

export interface Context {
  request: ServerRequest;
  response: Response;
  path: string;
  method: string;
  params: Record<string, string>;
  url: URL;
  queryParams: Record<string, string>;
  abc: Abc;
  string(v: string, code?: number): void;
  json(v: Record<string, any> | string, code?: number): void;

  /** Sends an HTTP response with status code. */
  html(v: string, code?: number): void;

  /** Sends an HTTP blob response with status code. */
  htmlBlob(b: Uint8Array | Deno.Reader, code?: number): void;

  /**
   * Renders a template with data and sends a text/html response with status code.
   * Abc.renderer must be registered first.
   */
  render<T>(name: string, data?: T, code?: number): void;

  /** Sends a blob response with content type and status code. */
  blob(b: Uint8Array | Deno.Reader, contentType: string, code?: number): void;
  bind<T>(cls: Type<T>): Promise<T>;
}

class ContextImpl implements Context {
  private _request: ServerRequest;
  set request(r: ServerRequest) {
    this._request = r;
  }
  get request() {
    return this._request;
  }

  private _response: Response;
  set response(r: Response) {
    this._response = r;
  }
  get response() {
    return this._response;
  }

  get path(): string {
    return this.url.pathname;
  }

  get method(): string {
    return this.request.method;
  }

  get queryParams(): Record<string, string> {
    const params = {};
    for (const key of this.url.searchParams.keys()) {
      params[key] = this.url.searchParams.get(key);
    }
    return params;
  }

  private _url: URL;
  set url(u) {
    this._url = u;
  }
  get url(): URL {
    return this._url;
  }

  private _params: Record<string, string>;
  set params(p) {
    this._params = p;
  }
  get params() {
    return this._params;
  }

  private _abc: Abc;
  set abc(abc: Abc) {
    this._abc = abc;
  }
  get abc() {
    return this._abc;
  }

  constructor(options: ContextOptions) {
    this.request = options.r || ({} as ServerRequest);
    this.url = options.url || new URL("0.0.0.0:8080");
    this.abc = options.abc || ({} as Abc);

    this.response = {};
    this.params = {};
  }

  private writeContentType(v: string) {
    if (!this.response.headers) {
      this.response.headers = new Headers();
    }
    if (!this.response.headers.has("content-type")) {
      this.response.headers.set("content-type", v);
    }
  }

  string(v: string, code = Status.OK) {
    this.writeContentType("text/plain");
    this.response.status = code;
    this.response.body = new TextEncoder().encode(v);
  }

  json(v: Record<string, any> | string, code = Status.OK) {
    this.writeContentType("application/json");
    this.response.status = code;
    this.response.body = new TextEncoder().encode(
      typeof v === "object" ? JSON.stringify(v) : v
    );
  }

  html(v: string, code = Status.OK) {
    this.writeContentType("text/html");
    this.response.status = code;
    this.response.body = new TextEncoder().encode(v);
  }

  htmlBlob(b: Uint8Array | Deno.Reader, code = Status.OK) {
    this.blob(b, "text/html", code);
  }

  async render<T>(name: string, data = {} as T, code = Status.OK) {
    if (!this.abc.renderer) {
      throw new Error();
    }
    const r = await this.abc.renderer.render(name, data);
    this.htmlBlob(r, code);
  }

  blob(b: Uint8Array | Deno.Reader, contentType: string, code = Status.OK) {
    this.writeContentType(contentType);
    this.response.status = code;
    this.response.body = b;
  }

  bind<T>(cls: Type<T>): Promise<T> {
    return bind(cls, this);
  }
}

export interface ContextOptions {
  r?: ServerRequest;
  url?: URL;
  abc?: Abc;
}

export function context(options = {} as ContextOptions) {
  const c = new ContextImpl(options) as Context;
  return c;
}
