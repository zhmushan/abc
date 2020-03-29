// TODO: waiting for denoland/deno#4297
// import type { Application } from "./app.ts";
// import type { ServerRequest, Response } from "./deps.ts";

import { Application } from "./app.ts";
import { ServerRequest, Response } from "./deps.ts";

import { Status, path, cookie } from "./deps.ts";
import { NotFoundHandler } from "./app.ts";
import { Header, MIME } from "./constants.ts";
const { cwd, lstat, readFile, readAll } = Deno;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type Cookie = cookie.Cookie;
type Cookies = cookie.Cookies;

export class Context {
  app: Application;
  request: ServerRequest;
  url: URL;

  response: Response = { headers: new Headers() };
  params: Record<string, string> = {};

  get cookies(): Cookies {
    return cookie.getCookies(this.request);
  }

  get path(): string {
    return this.url.pathname;
  }

  get method(): string {
    return this.request.method;
  }

  get queryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [k, v] of this.url.searchParams) {
      params[k] = v;
    }
    return params;
  }

  constructor(opts: { app: Application; r: ServerRequest }) {
    this.app = opts.app;
    this.request = opts.r;

    this.url = new URL(this.request.url, `http://0.0.0.0`);
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
    return JSON.parse(decoder.decode(await readAll(this.request.body)));
  }

  string(v: string, code: Status = Status.OK): void {
    this.writeContentType(MIME.TextPlain);
    this.response.status = code;
    this.response.body = encoder.encode(v);
  }

  json(v: Record<string, any> | string, code: Status = Status.OK): void {
    this.writeContentType(MIME.ApplicationJSON);
    this.response.status = code;
    this.response.body = encoder.encode(
      typeof v === "object" ? JSON.stringify(v) : v,
    );
  }

  /** Sends an HTTP response with status code. */
  html(v: string, code: Status = Status.OK): void {
    this.writeContentType(MIME.TextHTML);
    this.response.status = code;
    this.response.body = encoder.encode(v);
  }

  /** Sends an HTTP blob response with status code. */
  htmlBlob(b: Uint8Array | Deno.Reader, code: Status = Status.OK): void {
    this.blob(b, MIME.TextHTML, code);
  }

  /**
   * Renders a template with data and sends a text/html response with status code.
   * renderer must be registered first.
   */
  async render<T>(
    name: string,
    data: T = {} as T,
    code: Status = Status.OK,
  ): Promise<void> {
    if (!this.app.renderer) {
      throw new Error();
    }
    const r = await this.app.renderer.render(name, data);
    this.htmlBlob(r, code);
  }

  /** Sends a blob response with content type and status code. */
  blob(
    b: Uint8Array | Deno.Reader,
    contentType: string,
    code: Status = Status.OK,
  ): void {
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

  /** append a `Set-Cookie` header to the response */
  setCookie(c: Cookie): void {
    cookie.setCookie(this.response, c);
  }
}
