import { ServerRequest, Response, Status, path } from "./deps.ts";
import { Abc, NotFoundHandler } from "./abc.ts";
import { bind } from "./binder.ts";
import { Type } from "./type.ts";
const { cwd, lstat, readFile } = Deno;

export class Context {
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

  /** Sends an HTTP response with status code. */
  html(v: string, code = Status.OK) {
    this.writeContentType("text/html");
    this.response.status = code;
    this.response.body = new TextEncoder().encode(v);
  }

  /** Sends an HTTP blob response with status code. */
  htmlBlob(b: Uint8Array | Deno.Reader, code = Status.OK) {
    this.blob(b, "text/html", code);
  }

  /**
   * Renders a template with data and sends a text/html response with status code.
   * Abc.renderer must be registered first.
   */
  async render<T>(name: string, data = {} as T, code = Status.OK) {
    if (!this.abc.renderer) {
      throw new Error();
    }
    const r = await this.abc.renderer.render(name, data);
    this.htmlBlob(r, code);
  }

  /** Sends a blob response with content type and status code. */
  blob(b: Uint8Array | Deno.Reader, contentType: string, code = Status.OK) {
    this.writeContentType(contentType);
    this.response.status = code;
    this.response.body = b;
  }

  async file(filepath: string) {
    filepath = path.join(cwd(), filepath);
    try {
      const fileinfo = await lstat(filepath);
      if (
        fileinfo.isDirectory() &&
        (await lstat(filepath + "index.html")).isFile()
      ) {
        filepath = path.join(filepath, "index.html");
      }
      return new TextDecoder().decode(await readFile(filepath));
    } catch {
      return NotFoundHandler(this);
    }
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
  const c = new Context(options);
  return c;
}
