import { parse } from "./package.ts";
import { notImplemented } from "./abc.ts";

export class Parser {
  static json(data: string): [{}, Error] {
    let result: {}, err: Error;
    if (data.length === 0) {
      result = {};
    }
    const first = firstchar(data);
    if (first !== "{" && first !== "[") {
      err = new SyntaxError(data);
    }
    try {
      result = JSON.parse(data);
    } catch (e) {
      err = e;
    }
    return [result, err];
  }
  static urlencoded(data: string): [{}, Error] {
    let result: {}, err: Error;
    try {
      result = parse(data);
    } catch (e) {
      err = e;
    }
    return [result, err];
  }
  static multipart(data: string): [{}, Error] {
    return [undefined, notImplemented()];
  }
}

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
