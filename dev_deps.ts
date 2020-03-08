import { ServerRequest } from "./deps.ts";

export { runIfMain } from "https://deno.land/std@v0.35.0/testing/bench.ts";
export {
  assertEquals,
  assertNotEquals,
  assertThrowsAsync,
  assertThrows,
  assert
} from "https://deno.land/std@v0.35.0/testing/asserts.ts";

export function createMockRequest(
  url = "https://example.com/"
): ServerRequest {
  return {
    url,
    async respond() {}
  } as any;
}
