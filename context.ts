import type { Application } from "./app.ts";
import type { ServerRequest, Response } from "./deps.ts";

import {
  Status,
  path,
  cookie,
  MultipartReader,
  encode,
  decode,
} from "./deps.ts";
import { Header, MIME } from "./constants.ts";
import { contentType, NotFoundHandler } from "./util.ts";

const { cwd, lstat, readFile, readAll } = Deno;

type Cookie = cookie.Cookie;
type Cookies = cookie.Cookies;

export class Context {
  app: Application;
  request: ServerRequest;
  url: URL;

  response: Response & { headers: Headers } = { headers: new Headers() };
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

  #writeContentType = (v: string): void => {
    if (!this.response.headers.has(Header.ContentType)) {
      this.response.headers.set(Header.ContentType, v);
    }
  };

  async body<T extends unknown>(): Promise<T> {
    const contentType = this.request.headers.get(Header.ContentType);
    walk: {
      let data: Record<string, unknown> = {};
      if (contentType) {
        if (contentType.includes(MIME.ApplicationJSON)) {
          data = JSON.parse(decode(await readAll(this.request.body)));
        } else if (contentType.includes(MIME.ApplicationForm)) {
          for (
            const [k, v] of new URLSearchParams(
              decode(await readAll(this.request.body)),
            )
          ) {
            data[k] = v;
          }
        } else if (contentType.includes(MIME.MultipartForm)) {
          const match = contentType.match(/boundary=([^\s]+)/);
          const boundary = match ? match[1] : undefined;
          if (boundary) {
            const mr = new MultipartReader(this.request.body, boundary);
            const form = await mr.readForm();
            for (const [k, v] of form.entries()) {
              data[k] = v;
            }
          }
        } else {
          break walk;
        }
      } else {
        break walk;
      }

      return data as T;
    }

    return decode(await readAll(this.request.body)) as T;
  }

  string(v: string, code: Status = Status.OK): void {
    this.#writeContentType(MIME.TextPlain);
    this.response.status = code;
    this.response.body = encode(v);
  }

  json(v: Record<string, any> | string, code: Status = Status.OK): void {
    this.#writeContentType(MIME.ApplicationJSON);
    this.response.status = code;
    this.response.body = encode(typeof v === "object" ? JSON.stringify(v) : v);
  }

  /** Sends an HTTP response with status code. */
  html(v: string, code: Status = Status.OK): void {
    this.#writeContentType(MIME.TextHTML);
    this.response.status = code;
    this.response.body = encode(v);
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
    contentType?: string,
    code: Status = Status.OK,
  ): void {
    if (contentType) {
      this.#writeContentType(contentType);
    }
    this.response.status = code;
    this.response.body = b;
  }

  async file(filepath: string): Promise<void> {
    filepath = path.join(cwd(), filepath);
    try {
      const fileinfo = await lstat(filepath);
      if (
        fileinfo.isDirectory &&
        (await lstat(filepath + "index.html")).isFile
      ) {
        filepath = path.join(filepath, "index.html");
      }
      this.blob(await readFile(filepath), contentType(filepath));
    } catch {
      NotFoundHandler();
    }
  }

  /** append a `Set-Cookie` header to the response */
  setCookie(c: Cookie): void {
    cookie.setCookie(this.response, c);
  }

  /** Redirects a response to a specific URL. the `code` defaults to `302` if omitted */
  redirect(url: string, code = Status.Found): void {
    this.response.headers.set(Header.Location, url);
    this.response.status = code;
  }
}
