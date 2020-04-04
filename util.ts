import { path } from "./deps.ts";
import { MIME } from "./constants.ts";

/** Returns the content-type based on the extension of a path. */
export function contentType(filepath: string): string | undefined {
  return MIME.DB[path.extname(filepath)];
}
