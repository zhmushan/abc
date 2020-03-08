import { IContext, HandlerFunc, IRouter } from "./types.ts";
import Node from "./node.ts";

export default class implements IRouter {
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

  find(method: string, c: IContext): HandlerFunc | undefined {
    const node = this.trees[method];
    if (node) {
      const [handle, params, _] = node.getValue(c.path);
      if (params) {
        for (const p of params) {
          c.params[p.key] = p.value;
        }
      }

      return handle;
    }
  }
}
