import { IContext } from "../types.ts";

export type Skipper = (c?: IContext) => boolean;

export const DefaultSkipper: Skipper = function(): boolean {
  return false;
};
