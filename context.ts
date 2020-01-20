import { ServerRequest, Response, Status, path } from "./deps.ts";
import { Abc, NotFoundHandler } from "./abc.ts";
import { bind } from "./binder.ts";
import { Type } from "./type.ts";
import { Header, MIME } from "./constants.ts";
const { cwd, lstat, readFile, readAll } = Deno;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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
  get response(): Response {
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
  set url(u: URL) {
    this._url = u;
  }
  get url(): URL {
    return this._url;
  }

  private _params: Record<string, string>;
  set params(p: Record<string, string>) {
    this._params = p;
  }
  get params(): Record<string, string> {
    return this._params;
  }

  private _abc: Abc;
  set abc(abc: Abc) {
    this._abc = abc;
  }
  get abc(): Abc {
    return this._abc;
  }

  constructor(options: ContextOptions) {
    this.request = options.r || ({} as ServerRequest);
    this.url = options.url || new URL("http://0.0.0.0:8080");
    this.abc = options.abc || ({} as Abc);

    this.response = {};
    this.params = {};
  }

  private writeContentType(v: string): void {
    if (!this.response.headers) {
      this.response.headers = new Headers();
    }
    if (!this.response.headers.has(Header.ContentType)) {
      this.response.headers.set(Header.ContentType, v);
    }
  }

  async body(): Promise<Record<string, unknown>> {
    return JSON.parse(
      decoder.decode(await readAll(this.request.body))
    );
  }

  string(v: string, code = Status.OK): void {
    this.writeContentType(MIME.TextPlain);
    this.response.status = code;
    this.response.body = encoder.encode(v);
  }

  json(v: Record<string, any> | string, code = Status.OK): void {
    this.writeContentType(MIME.ApplicationJSON);
    this.response.status = code;
    this.response.body = encoder.encode(
      typeof v === "object" ? JSON.stringify(v) : v
    );
  }

  /** Sends an HTTP response with status code. */
  html(v: string, code = Status.OK): void {
    this.writeContentType(MIME.TextHTML);
    this.response.status = code;
    this.response.body = encoder.encode(v);
  }

  /** Sends an HTTP blob response with status code. */
  htmlBlob(b: Uint8Array | Deno.Reader, code = Status.OK): void {
    this.blob(b, MIME.TextHTML, code);
  }

  /**
   * Renders a template with data and sends a text/html response with status code.
   * Abc.renderer must be registered first.
   */
  async render<T>(name: string, data = {} as T, code = Status.OK): Promise<void> {
    if (!this.abc.renderer) {
      throw new Error();
    }
    const r = await this.abc.renderer.render(name, data);
    this.htmlBlob(r, code);
  }

  /** Sends a blob response with content type and status code. */
  blob(b: Uint8Array | Deno.Reader, contentType: string, code = Status.OK): void {
    this.writeContentType(contentType);
    this.response.status = code;
    this.response.body = b;
  }

  async file(filepath: string): Promise<string> {
    filepath = path.join(cwd(), filepath);
    try {
      const fileinfo = await lstat(filepath);
      if (
        fileinfo.isDirectory() &&
        (await lstat(filepath + "index.html")).isFile()
      ) {
        filepath = path.join(filepath, "index.html");
      }
      return decoder.decode(await readFile(filepath));
    } catch {
      NotFoundHandler();
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

export function context(options: ContextOptions = {}): Context {
  const c = new Context(options);
  return c;
}
