import { handlerFunc } from "abc.ts";
import { Context } from "context.ts";

export class Router {
  trees = new Map<string, Node>();

  constructor() {
    this.trees = new Map();
  }
  add(method: string, path: string, h: handlerFunc) {
    if (path[0] !== "/") {
      console.error(`path must begin with '/' in path '${path}'`);
    }

    if (!this.trees) {
      this.trees = new Map();
    }

    let root = this.trees.get(method);
    if (!root) {
      root = new Node();
      this.trees.set(method, root);
    }

    root.addRoute(path, h);
  }
  find(method: string, path: string, c: Context): handlerFunc {
    const node = this.trees.get(method);
    if (node) {
      const [handle, params, tsr] = node.getValue(path);
      if (params) {
        for (const p of params) {
          c.params[p.key] = p.value;
        }
      }

      return handle;
    }
  }
}

export class Node {
  priority = 0;
  children: Children = [];
  path = "";
  wildChild = false;
  nType = NodeType.Static;
  indices = "";
  handle: handlerFunc;
  maxParams = 0;

  addRoute(path: string, handle: handlerFunc) {
    let node = this as Node;
    const fullPath = path;
    node.priority++;
    let numParams = this.countParams(path);

    // non-empty tree
    if (path.length > 0 || node.children.length > 0) {
      walk: while (true) {
        // Update maxParams of the current node
        if (numParams > node.maxParams) {
          node.maxParams = numParams;
        }

        // Find the longest common prefix.
        // This also implies that the common prefix contains no ':' or '*'
        // since the existing key can't contain those chars.
        let i = 0;
        let max = Math.min(path.length, node.path.length);
        while (i < max && path[i] === node.path[i]) {
          i++;
        }

        // Split edge
        if (i < node.path.length) {
          let child = new Node();
          child.path = node.path.slice(i);
          child.wildChild = node.wildChild;
          child.nType = NodeType.Static;
          child.indices = node.indices;
          child.children = node.children;
          child.handle = node.handle;
          child.priority = node.priority - 1;

          // Update maxParams (max of all children)
          for (const cc of child.children) {
            if (cc.maxParams > child.maxParams) {
              child.maxParams = cc.maxParams;
            }
          }

          node.children = [child];
          node.indices = node.path[i];
          node.path = path.slice(0, i);
          node.handle = null;
          node.wildChild = false;
        }

        // Make new node a child of this node
        if (i < path.length) {
          path = path.slice(i);

          if (node.wildChild) {
            node = node.children[0];
            node.priority++;

            // Update maxParams of the child node
            if (numParams > node.maxParams) {
              node.maxParams = numParams;
            }
            numParams--;

            // Check if the wildcard matches
            if (
              path.length >= this.path.length &&
              node.path === path.slice(0, node.path.length) &&
              // Check for longer wildcard, e.g. :name and :names
              (node.path.length >= path.length ||
                path[node.path.length] === "/")
            ) {
              continue walk;
            } else {
              // Wildcard conflict
              let pathSeg = "";
              if (node.nType === NodeType.CatchAll) {
                pathSeg = path;
              } else {
                pathSeg = path.split("/", 1)[0];
              }
              let prefix =
                fullPath.slice(0, fullPath.indexOf(pathSeg)) + node.path;
              console.error(
                `'${pathSeg}' in new path '${fullPath}' conflicts with existing wildcard '${
                  node.path
                }' in existing prefix '${prefix}'`
              );
            }
          }

          let c = path[0];

          // slash after param
          if (
            node.nType === NodeType.Param &&
            c === "/" &&
            node.children.length === 1
          ) {
            node = node.children[0];
            node.priority++;
            continue walk;
          }

          // Check if a child with the next path byte exists
          for (let i = 0; i < node.indices.length; i++) {
            if (c === node.indices[i]) {
              i = node.incrementChildPrio(i);
              node = node.children[i];
              continue walk;
            }
          }

          // Otherwise insert it
          if (c !== ":" && c !== "*") {
            node.indices += c;
            const child = new Node();
            child.maxParams = numParams;

            node.children.push(child);
            node.incrementChildPrio(node.indices.length - 1);
            node = child;
          }
          node.insertChild(numParams, path, fullPath, handle);
          return;
        } else if (i === path.length) {
          // Make node a (in-path) leaf
          if (node.handle) {
            console.error(
              `a handle is already registered for path '${fullPath}'`
            );
          }
          node.handle = handle;
        }
        return;
      }
    } else {
      // Empty tree
      node.insertChild(numParams, path, fullPath, handle);
      node.nType = NodeType.Root;
    }
  }

  countParams(path: string) {
    let n = 0;
    for (let i = 0; i < path.length; i++) {
      if (path[i] !== ":" && path[i] !== "*") {
        continue;
      }
      n++;
    }
    if (n >= 255) {
      return 255;
    }
    return n;
  }

  // increments priority of the given child and reorders if necessary
  incrementChildPrio(pos: number) {
    let node = this as Node;
    node.children[pos].priority++;
    let prio = node.children[pos].priority;

    // adjust position (move to front)
    let newPos = pos;
    while (newPos > 0 && node.children[newPos - 1].priority < prio) {
      // swap node positions
      [node.children[newPos - 1], node.children[newPos]] = [
        node.children[newPos],
        node.children[newPos - 1]
      ];

      newPos--;
    }

    // build new index char string
    if (newPos !== pos) {
      node.indices =
        node.indices.slice(0, newPos) + // unchanged prefix, might be empty
        node.indices.slice(pos, pos + 1) + // the index char we move
        node.indices.slice(newPos, pos) +
        node.indices.slice(pos + 1); // rest without char at 'pos'
    }

    return newPos;
  }
  insertChild(
    numParams: number,
    path: string,
    fullPath: string,
    handle: handlerFunc
  ) {
    let node = this as Node;
    let offset = 0; // already handled bytes of the path

    // find prefix until first wildcard (beginning with ':'' or '*'')
    for (let i = 0, max = path.length; numParams > 0; i++) {
      let c = path[i];
      if (c !== ":" && c !== "*") {
        continue;
      }

      // find wildcard end (either '/' or path end)
      let end = i + 1;
      while (end < max && path[end] !== "/") {
        switch (path[end]) {
          // the wildcard name must not contain ':' and '*'
          case ":":
          case "*":
            console.error(
              `only one wildcard per path segment is allowed, has: '${path.slice(
                i
              )}' in path '${fullPath}'`
            );
          default:
            end++;
        }
      }

      // check if this Node existing children which would be
      // unreachable if we insert the wildcard here
      if (node.children.length > 0) {
        console.error(
          `wildcard route '${path.slice(
            i,
            end
          )}' conflicts with existing children in path '${fullPath}'`
        );
      }

      // check if the wildcard has a name
      if (end - i < 2) {
        console.error(
          `wildcards must be named with a non-empty name in path '${fullPath}'`
        );
      }

      if (c === ":") {
        // param
        // split path at the beginning of the wildcard
        if (i > 0) {
          node.path = path.slice(offset, i);
          offset = i;
        }

        const child = new Node();
        child.nType = NodeType.Param;
        child.maxParams = numParams;

        node.children = [child];
        node.wildChild = true;
        node = child;
        node.priority++;
        numParams--;

        // if the path doesn't end with the wildcard, then there
        // will be another non-wildcard subpath starting with '/'
        if (end < max) {
          node.path = path.slice(offset, end);
          offset = end;

          const child = new Node();
          child.maxParams = numParams;
          child.priority = 1;

          node.children = [child];
          node = child;
        }
      } else {
        // catchAll
        if (end !== max || numParams > 1) {
          console.error(
            `catch-all routes are only allowed at the end of the path in path '${fullPath}'`
          );
        }

        if (node.path.length > 0 && node.path[node.path.length - 1] === "/") {
          console.error(
            `catch-all conflicts with existing handle for the path segment root in path '${fullPath}'`
          );
        }

        // currently fixed width 1 for '/'
        i--;
        if (path[i] !== "/") {
          console.error(`no / before catch-all in path '${fullPath}'`);
        }

        node.path = path.slice(offset, i);

        // first node: catchAll node with empty path
        let child = new Node();
        child.wildChild = true;
        child.nType = NodeType.CatchAll;
        child.maxParams = 1;

        node.children = [child];
        node.indices = path[i];
        node = child;
        node.priority++;

        // second node: node holding the variable
        child = new Node();
        child.path = path.slice(i);
        child.nType = NodeType.CatchAll;
        child.maxParams = 1;
        child.handle = handle;
        child.priority = 1;

        node.children = [child];

        return;
      }
    }

    // insert remaining path part and handle to the leaf
    node.path = path.slice(offset);
    node.handle = handle;
  }
  getValue(path: string): [handlerFunc, Params, boolean] {
    let node = this as Node;
    let handle: handlerFunc, p: Params, tsr: boolean;
    // outer loop for walking the tree
    walk: while (true) {
      if (path.length > node.path.length) {
        if (path.slice(0, node.path.length) === node.path) {
          path = path.slice(node.path.length);
          // If this node does not have a wildcard (param or catchAll)
          // child,  we can just look up the next child node and continue
          // to walk down the tree
          if (!node.wildChild) {
            let c = path[0];
            for (let i = 0; i < node.indices.length; i++) {
              if (c === node.indices[i]) {
                node = node.children[i];
                continue walk;
              }
            }

            // Nothing found.
            // We can recommend to redirect to the same URL without a
            // trailing slash if a leaf exists for that path.
            tsr = node.handle && path === "/";
            break walk;
          }

          // handle wildcard child
          node = node.children[0];
          switch (node.nType) {
            case NodeType.Param:
              // find param end (either '/' or path end)
              let end = 0;
              while (end < path.length && path[end] !== "/") {
                end++;
              }

              // save param value
              if (!p) {
                // lazy allocation
                p = [];
              }
              let i = p.length;
              p[i] = {
                key: node.path.slice(1),
                value: path.slice(0, end)
              };

              // we need to go deeper!
              if (end < path.length) {
                if (node.children.length > 0) {
                  path = path.slice(end);
                  node = node.children[0];
                  continue walk;
                }

                // ... but we can't
                tsr = path.length === end + 1;
                break walk;
              }

              handle = node.handle;
              if (handle) {
                break walk;
              } else if (node.children.length === 1) {
                // No handle found. Check if a handle for this path + a
                // trailing slash exists for TSR recommendation
                node = node.children[0];
                tsr = node.handle && node.path === "/";
              }
              break walk;

            case NodeType.CatchAll:
              // save param value
              if (!p) {
                // lazy allocation
                p = [];
              }
              i = p.length;
              p[i] = {
                key: node.path.slice(2),
                value: path
              };

              handle = node.handle;
              break walk;

            default:
              console.error("invalid node type");
          }
        }
      } else if (path === node.path) {
        // We should have reached the node containing the handle.
        // Check if this node has a handle registered.
        handle = node.handle;
        if (handle) {
          break walk;
        }

        if (path === "/" && node.wildChild && node.nType !== NodeType.Root) {
          tsr = true;
          break walk;
        }

        // No handle found. Check if a handle for this path + a
        // trailing slash exists for trailing slash recommendation
        for (let i = 0; i < node.indices.length; i++) {
          if (node.indices[i] === "/") {
            node = node.children[i];
            tsr =
              (node.handle && node.path.length === 1) ||
              (node.children[0].handle && node.nType === NodeType.CatchAll);
            break walk;
          }
        }

        break walk;
      }

      // Nothing found. We can recommend to redirect to the same URL with an
      // extra trailing slash if a leaf exists for that path
      tsr =
        path === "/" ||
        (node.path.length === path.length + 1 &&
          node.path[path.length] === "/" &&
          node.handle &&
          path === node.path.slice(0, node.path.length - 1));
      break walk;
    }
    return [handle, p, tsr];
  }
}

enum NodeType {
  Static,
  Root,
  Param,
  CatchAll
}

interface Param {
  key: string;
  value: string;
}

type Children = Node[];
type Params = Param[];
