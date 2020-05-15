// TODO: waiting for denoland/deno#4297
// import type { Application } from "./app.ts";
// import type { ServerRequest, Response } from "./deps.ts";

import { Application } from "./app.ts";
import { ServerRequest, Response } from "./deps.ts";

import { Status, path, cookie } from "./deps.ts";
import { NotFoundHandler } from "./app.ts";
import { Header, MIME } from "./constants.ts";
import { contentType } from "./util.ts";
import { MultipartReader } from "https://deno.land/std@v0.50.0/mime/multipart.ts";
import {
  BufReader,
  ReadLineResult,
} from "https://deno.land/std@v0.50.0/io/bufio.ts";

const { cwd, lstat, readFile, readAll } = Deno;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

  private writeContentType(v: string): void {
    if (!this.response.headers.has(Header.ContentType)) {
      this.response.headers.set(Header.ContentType, v);
    }
  }

  private parseFormData = async (
    reader: MultipartReader,
    array: Uint8Array,
  ) => {
    const bufReader = new BufReader(new Deno.Buffer(array));

    const dashBoundary = reader.dashBoundary;
    const dashBoundaryString = decoder.decode(dashBoundary);

    const dashBoundaryDash = reader.dashBoundaryDash;
    const dashBoundaryDashString = decoder.decode(dashBoundaryDash);

    let i: Uint8Array[] = [];
    let valArray: Uint8Array[] = [];

    while (true) {
      const lr: ReadLineResult | null = await bufReader.readLine();

      if (lr === null) {
        break;
      }

      const line: string = decoder.decode(lr.line);

      if (line !== dashBoundaryString && line !== dashBoundaryDashString) {
        i = i.concat(lr.line);
      } else {
        const s = i.reduce((p, c) => p + c.byteLength, 0);

        if (s !== 0) {
          const t = i.reduce((p, c) => {
            const n = new Uint8Array(p.length + c.length);
            n.set(p);
            n.set(c, p.length);
            return n;
          }, new Uint8Array(0));

          valArray = valArray.concat(t);
          i = [];
        }
      }
    }

    return valArray;
  };

  private parseToJson = (p: Uint8Array[]) => {
    const r = /(?<=form-data\;\sname=").+/;
    const t = p.reduce((p, c) => {
      const line = decoder.decode(c);
      const k = r.exec(line)?.[0];
      const v = k?.split('\"');

      if (!v) return p;

      return {
        ...p,
        [v[0]]: v[1],
      };
    }, {});

    return t;
  };

  private splitContentType = (c: string | null) => {
    if (!c) return undefined;

    const s = c.split("; boundary=");

    return {
      enc: s[0],
      boundary: s[1],
    };
  };

  async body(): Promise<Record<string, unknown>> {
    const ct = this.request.headers.get("content-type");
    const r = await readAll(this.request.body);
    const d = decoder.decode(r);
    const s = this.splitContentType(ct);

    if (!s?.boundary) {
      return JSON.parse(d);
    } else {
      const re = new RegExp(s.boundary);
      const m = new MultipartReader(this.request.body, re.exec(d)?.[0] ?? "");
      const result = await this.parseFormData(m, r);
      const j = this.parseToJson(result);
      return j;
    }
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
    contentType?: string,
    code: Status = Status.OK,
  ): void {
    if (contentType) {
      this.writeContentType(contentType);
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
