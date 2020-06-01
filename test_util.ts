import type { ServerRequest } from "./vendor/https/deno.land/std/http/server.ts";

import { encode } from "./vendor/https/deno.land/std/encoding/utf8.ts";
import { Application } from "./app.ts";

export function createApplication(): Application {
  const app = new Application();
  app.start({ port: 8081 });
  return app;
}

export function createMockRequest(
  options: {
    url?: string;
    headers?: Headers;
    respond?: () => Promise<void>;
    body?: Deno.Reader;
  } = {},
): ServerRequest {
  options.url = options.url ?? "https://example.com/";
  options.headers = options.headers ?? new Headers();
  options.respond = options.respond ?? async function (): Promise<void> {};
  options.body = options.body ?? undefined;

  return { ...options } as any;
}

export function createMockBodyReader(data: string): Deno.Reader {
  const buf = encode(data);
  let offset = 0;
  return {
    async read(p: Uint8Array): Promise<number | null> {
      if (offset >= buf.length) {
        return null;
      }
      const chunkSize = Math.min(p.length, buf.length - offset);
      p.set(buf);
      offset += chunkSize;
      return chunkSize;
    },
  };
}
