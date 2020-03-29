import { ServerRequest } from "./deps.ts";
import { Application } from "./app.ts";

export function createApplication(): Application {
  const app = new Application();
  app.start({ port: 8081 });
  return app;
}

export function createMockRequest(
  url = "https://example.com/",
): ServerRequest {
  return {
    url,
    headers: new Headers(),
    async respond() {},
  } as any;
}
