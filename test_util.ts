import { Application } from "./app.ts";

const encoder = new TextEncoder();

export function createApplication(): Application {
  const app = new Application();
  app.start({ port: 8081 });
  return app;
}

export function createMockRequest(
  options: { url?: string } & RequestInit = {},
): Request {
  options.url = options.url ?? "https://example.com/";
  options.headers = options.headers ?? new Headers();
  options.body = options.body ?? undefined;
  options.method = options.method ?? "POST";

  return new Request(options.url, { ...options });
}
