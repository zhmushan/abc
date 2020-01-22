import { parse } from "./deps.ts";
import { NotImplemented } from "./abc.ts";
import { MIME } from "./constants.ts";

/**
 * RegExp to match the first non-space in a string.
 *
 * https://tools.ietf.org/html/rfc7159
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */
function firstchar(str: string): string {
  return /^[\x20\x09\x0a\x0d]*(.)/.exec(str)[1];
}

function json(data: string): Record<string, unknown> {
  let result: Record<string, unknown>;
  if (data.length === 0) {
    result = {};
  }
  const first = firstchar(data);
  if (first !== "{" && first !== "[") {
    throw new SyntaxError(data);
  }
  result = JSON.parse(data);
  return result;
}

function urlencoded(data: string): Record<string, unknown> {
  const result: Record<string, unknown> = parse(data);
  return result;
}

function multipart(data: string): Record<string, unknown> {
  data;
  throw NotImplemented();
}

export class Parser {
  private type: string;
  constructor(type: string) {
    this.type = type;
  }

  parse(data: string): Record<string, unknown> {
    let rtv: Record<string, unknown>;
    if (this.type === MIME.ApplicationJSON) {
      rtv = json(data);
    } else if (this.type === MIME.ApplicationForm) {
      rtv = urlencoded(data);
    } else if (this.type === MIME.MultipartForm) {
      rtv = multipart(data);
    }

    return rtv;
  }
}
