import type { HandlerFunc } from "./types.ts";
import type { Context } from "./context.ts";

import { Node } from "./deps.ts";
import { NotFoundHandler } from "./util.ts";

export class Router {
  trees: Record<string, Node> = {};

  add(method: string, path: string, h: HandlerFunc): void {
    if (path[0] !== "/") {
      path = `/${path}`;
    }

    let root = this.trees[method];
    if (!root) {
      root = new Node();
      this.trees[method] = root;
    }

    root.add(path, h);
  }

  find(method: string, c: Context): HandlerFunc {
    const node = this.trees[method];
    let h: HandlerFunc | undefined;
    if (node) {
      const [handle, params] = node.find(c.path);
      if (params) {
        for (const [k, v] of params) {
          c.params[k] = v;
        }
      }

      if (handle) {
        h = handle as HandlerFunc;
      }
    }

    return h ?? NotFoundHandler;
  }
}
