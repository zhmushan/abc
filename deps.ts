import * as _path from "https://deno.land/std@v0.35.0/path/mod.ts";

export {
  serve,
  ServerRequest,
  Response,
  Server
} from "https://deno.land/std@v0.35.0/http/server.ts";
export {
  Status,
  STATUS_TEXT
} from "https://deno.land/std@v0.35.0/http/http_status.ts";
export const path = _path;
