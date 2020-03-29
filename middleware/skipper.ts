// TODO: waiting for denoland/deno#4297
// import type { Context } from "../context.ts";

import { Context } from "../context.ts";

export type Skipper = (c?: Context) => boolean;

export const DefaultSkipper: Skipper = function (): boolean {
  return false;
};
