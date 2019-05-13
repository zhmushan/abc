import { parse } from "./deps.ts";
import { NotImplemented } from "./abc.ts";

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
function firstchar(str: string) {
  return /^[\x20\x09\x0a\x0d]*(.)/.exec(str)[1];
}

export class Parser {
  static json(data: string): Record<string, any> {
    let result: Record<string, any>;
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
  static urlencoded(data: string): Record<string, any> {
    let result: Record<string, any>;
    result = parse(data);
    return result;
  }
  static multipart(data: string): Record<string, any> {
    data;
    throw NotImplemented();
  }
}

export type ParserFunction = "json" | "urlencoded" | "multipart";
