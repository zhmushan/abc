import { ServerRequest, Response, Status, path } from "./deps.ts";
import { NotFoundHandler } from "./app.ts";
import { Header, MIME } from "./constants.ts";
import { IContext, IApplication } from "./types.ts";
const { cwd, lstat, readFile, readAll } = Deno;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default class implements IContext {
  app: IApplication;
  request: ServerRequest;

  response: Response = { headers: new Headers() };
  params: Record<string, string> = {};
  queryParams = new URLSearchParams();

  get path() {
    return this.request.url;
  }

  get method() {
    return this.request.method;
  }

  constructor(opts: { app: IApplication; r: ServerRequest }) {
    this.app = opts.app;
    this.request = opts.r;
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
      typeof v === "object" ? JSON.stringify(v) : v
    );
  }

  html(v: string, code: Status = Status.OK): void {
    this.writeContentType(MIME.TextHTML);
    this.response.status = code;
    this.response.body = encoder.encode(v);
  }

  htmlBlob(b: Uint8Array | Deno.Reader, code: Status = Status.OK): void {
    this.blob(b, MIME.TextHTML, code);
  }

  async render<T>(
    name: string,
    data: T = {} as T,
    code: Status = Status.OK
  ): Promise<void> {
    if (!this.app.renderer) {
      throw new Error();
    }
    const r = await this.app.renderer.render(name, data);
    this.htmlBlob(r, code);
  }

  blob(
    b: Uint8Array | Deno.Reader,
    contentType: string,
    code: Status = Status.OK
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
}
