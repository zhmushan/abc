import type { Context } from "../context.ts";

export type Skipper = (c?: Context) => boolean;

export const DefaultSkipper: Skipper = function (): boolean {
  return false;
};
