import { path } from "./deps.ts";
import { MIME } from "./constants.ts";
import { NotFoundException } from "./http_exception.ts";

/** Returns the content-type based on the extension of a path. */
export function contentType(filepath: string): string | undefined {
  return MIME.DB[path.extname(filepath)];
}

export function NotFoundHandler(): never {
  throw new NotFoundException();
}
