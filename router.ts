import type { HandlerFunc } from "./types.ts";
import type { Context } from "./context.ts";

import { Node } from "./node.ts";
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

    root.addRoute(path, h);
  }

  find(method: string, c: Context): HandlerFunc {
    const node = this.trees[method];
    let h: HandlerFunc | undefined;
    if (node) {
      const [handle, params, _] = node.getValue(c.path);
      if (params) {
        for (const p of params) {
          c.params[p.key] = p.value;
        }
      }

      if (handle) {
        h = handle;
      }
    }

    return h ?? NotFoundHandler;
  }
}
