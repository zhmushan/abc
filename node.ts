// The following code is based off:
// https://github.com/julienschmidt/httprouter
//
// Copyright (c) 2013, Julien Schmidt
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import type { HandlerFunc, Params } from "./types.ts";

export enum NodeType {
  Static,
  Root,
  Param,
  CatchAll,
}

export function countParams(path: string): number {
  let n = 0;
  for (let i = 0; i < path.length; ++i) {
    if (path[i] !== ":" && path[i] !== "*") {
      continue;
    }
    ++n;
  }
  if (n >= 255) {
    return 255;
  }
  return n;
}

export class Node {
  priority = 0;
  children: Node[] = [];
  path = "";
  wildChild = false;
  nType = NodeType.Static;
  indices = "";
  handle: HandlerFunc | undefined;
  maxParams = 0;

  addRoute(path: string, handle: HandlerFunc): void {
    let node: Node = this;
    const fullPath = path;
    ++node.priority;
    let numParams = countParams(path);

    // non-empty tree
    if (node.path.length > 0 || node.children.length > 0) {
      walk:
      while (true) {
        // Update maxParams of the current node
        if (numParams > node.maxParams) {
          node.maxParams = numParams;
        }

        // Find the longest common prefix.
        // This also implies that the common prefix contains no ':' or '*'
        // since the existing key can't contain those chars.
        let i = 0;
        const max = Math.min(path.length, node.path.length);
        for (; i < max && path[i] === node.path[i]; ++i);

        // Split edge
        if (i < node.path.length) {
          const child = new Node();
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
          node.handle = undefined;
          node.wildChild = false;
        }

        // Make new node a child of this node
        if (i < path.length) {
          path = path.slice(i);

          if (node.wildChild) {
            node = node.children[0];
            ++node.priority;

            // Update maxParams of the child node
            if (numParams > node.maxParams) {
              node.maxParams = numParams;
            }
            --numParams;

            // Check if the wildcard matches
            if (
              path.length >= node.path.length &&
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
              const prefix = fullPath.slice(0, fullPath.indexOf(pathSeg)) +
                node.path;
              throw new Error(
                `'${pathSeg}' in new path '${fullPath}' conflicts with existing wildcard '${node.path}' in existing prefix '${prefix}'`,
              );
            }
          }

          const c = path[0];

          // slash after param
          if (
            node.nType === NodeType.Param &&
            c === "/" &&
            node.children.length === 1
          ) {
            node = node.children[0];
            ++node.priority;
            continue walk;
          }

          // Check if a child with the next path byte exists
          for (let i = 0; i < node.indices.length; ++i) {
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
            throw new Error(
              `a handle is already registered for path '${fullPath}'`,
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

  // increments priority of the given child and reorders if necessary
  incrementChildPrio(pos: number): number {
    ++this.children[pos].priority;
    const prio = this.children[pos].priority;

    // adjust position (move to front)
    let newPos = pos;
    while (newPos > 0 && this.children[newPos - 1].priority < prio) {
      // swap node positions
      [this.children[newPos - 1], this.children[newPos]] = [
        this.children[newPos],
        this.children[newPos - 1],
      ];

      --newPos;
    }

    // build new index char string
    if (newPos !== pos) {
      this.indices = this.indices.slice(0, newPos) + // unchanged prefix, might be empty
        this.indices.slice(pos, pos + 1) + // the index char we move
        this.indices.slice(newPos, pos) +
        this.indices.slice(pos + 1); // rest without char at 'pos'
    }

    return newPos;
  }

  insertChild(
    numParams: number,
    path: string,
    fullPath: string,
    handle: HandlerFunc,
  ): void {
    let node: Node = this;
    let offset = 0; // already handled bytes of the path

    // find prefix until first wildcard (beginning with ':'' or '*'')
    for (let i = 0, max = path.length; numParams > 0; ++i) {
      const c = path[i];
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
            throw new Error(
              `only one wildcard per path segment is allowed, has: '${
                path.slice(
                  i,
                )
              }' in path '${fullPath}'`,
            );
          default:
            ++end;
        }
      }

      // check if this Node existing children which would be
      // unreachable if we insert the wildcard here
      if (node.children.length > 0) {
        throw new Error(
          `wildcard route '${
            path.slice(
              i,
              end,
            )
          }' conflicts with existing children in path '${fullPath}'`,
        );
      }

      // check if the wildcard has a name
      if (end - i < 2) {
        throw new Error(
          `wildcards must be named with a non-empty name in path '${fullPath}'`,
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
        ++node.priority;
        --numParams;

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
          throw new Error(
            `catch-all routes are only allowed at the end of the path in path '${fullPath}'`,
          );
        }

        if (node.path.length > 0 && node.path[node.path.length - 1] === "/") {
          throw new Error(
            `catch-all conflicts with existing handle for the path segment root in path '${fullPath}'`,
          );
        }

        // currently fixed width 1 for '/'
        --i;
        if (path[i] !== "/") {
          throw new Error(`no / before catch-all in path '${fullPath}'`);
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
        ++node.priority;

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

  getValue(
    path: string,
  ): [HandlerFunc | undefined, Params | undefined, boolean] {
    let node: Node = this;
    let handle: HandlerFunc | undefined,
      p: Params | undefined,
      tsr = false;
    // outer loop for walking the tree
    walk:
    while (true) {
      if (path.length > node.path.length) {
        if (path.slice(0, node.path.length) === node.path) {
          path = path.slice(node.path.length);
          // If this node does not have a wildcard (param or catchAll)
          // child,  we can just look up the next child node and continue
          // to walk down the tree
          if (!node.wildChild) {
            const c = path[0];
            for (let i = 0; i < node.indices.length; ++i) {
              if (c === node.indices[i]) {
                node = node.children[i];
                continue walk;
              }
            }

            // Nothing found.
            // We can recommend to redirect to the same URL without a
            // trailing slash if a leaf exists for that path.
            if (node.handle && path === "/") {
              tsr = true;
            }
            break walk;
          }

          // handle wildcard child
          node = node.children[0];
          switch (node.nType) {
            case NodeType.Param: {
              // find param end (either '/' or path end)
              let end = 0;
              for (; end < path.length && path[end] !== "/"; ++end);

              // save param value
              if (!p) {
                // lazy allocation
                p = [];
              }
              const i = p.length;
              p[i] = {
                key: node.path.slice(1),
                value: path.slice(0, end),
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
                if (node.handle && node.path === "/") {
                  tsr = true;
                }
              }
              break walk;
            }
            case NodeType.CatchAll: {
              // save param value
              if (!p) {
                // lazy allocation
                p = [];
              }
              const i = p.length;
              p[i] = {
                key: node.path.slice(2),
                value: path,
              };

              handle = node.handle;
              break walk;
            }
            default: {
              throw new Error("invalid node type");
            }
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
        for (let i = 0; i < node.indices.length; ++i) {
          if (node.indices[i] === "/") {
            node = node.children[i];
            if (
              (node.handle && node.path.length === 1) ||
              (node.children[0].handle && node.nType === NodeType.CatchAll)
            ) {
              tsr = true;
            }
            break walk;
          }
        }

        break walk;
      }

      // Nothing found. We can recommend to redirect to the same URL with an
      // extra trailing slash if a leaf exists for that path
      if (
        path === "/" ||
        (node.path.length === path.length + 1 &&
          node.path[path.length] === "/" &&
          node.handle &&
          path === node.path.slice(0, node.path.length - 1))
      ) {
        tsr = true;
      }
      break walk;
    }
    return [handle, p, tsr];
  }
}
