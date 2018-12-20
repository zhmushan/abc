import { serve, Status, STATUS_TEXT } from './package'
import { Context, context } from './context'
import { Router, Node } from './router'
import { Binder, binder } from './binder'

export interface Abc {
  router: Router
  middleware: middlewareFunc[]
  premiddleware: middlewareFunc[]
  binder: Binder
  start(addr: string): Promise<void>

  /** add middleware which is run before router. */
  pre(...m: middlewareFunc[]): Abc

  /** add middleware which is run after router. */
  use(...m: middlewareFunc[]): Abc

  connect(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  delete(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  get(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  head(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  options(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  patch(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  post(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  put(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  trace(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  any(path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  match(methods: string[], path: string, h: handlerFunc, ...m: middlewareFunc[]): Abc
  add(method: string, path: string, handler: handlerFunc, ...middleware: middlewareFunc[]): Abc

  /**
   * not implemented.
   * maybe it can add middleware to all routes which start with prefix.
   */
  group(prefix: string, ...m: middlewareFunc[]): Abc

  /**
   * not implemented.
   * reference net/file_server
   */
  static(prefix: string, root: string): Abc
}

class AbcImpl implements Abc {
  router: Router
  middleware: middlewareFunc[]
  premiddleware: middlewareFunc[]
  binder: Binder

  constructor() {
    this.router = new Router()
    this.middleware = []
    this.premiddleware = []
    this.binder = binder()
  }

  async start(addr: string) {
    const s = serve(addr)

    // Print all routes that added
    for (const t of this.router.trees) {
      function p(n: Node) {
        console.log(
          `method: '${t[0]}', path: '${n.path}', priority: '${n.priority}', wildChild: '${
            n.wildChild
          }', type: '${n.nType}', indices: '${n.indices}', maxParams: '${n.maxParams}'`
        )
        for (const nc of n.children) {
          if (nc.children) {
            p(nc)
          }
        }
      }
      p(t[1])
    }

    for await (const req of s) {
      const c = context(req)
      c.abc = this
      let h = this.router.find(req.method, req.url, c) || NotFoundHandler

      if (this.premiddleware.length) {
        h = c => {
          for (let i = this.middleware.length - 1; i >= 0; i--) {
            h = this.middleware[i](h)
          }
          return h(c)
        }
        for (let i = this.premiddleware.length - 1; i >= 0; i--) {
          h = this.premiddleware[i](h)
        }
      } else {
        for (let i = this.middleware.length - 1; i >= 0; i--) {
          h = this.middleware[i](h)
        }
      }

      this.transformResult(c, h(c))

      await req.respond(c.response)
    }
  }

  pre(...m: middlewareFunc[]) {
    this.premiddleware.push(...m)
    return this
  }
  use(...m: middlewareFunc[]) {
    this.middleware.push(...m)
    return this
  }
  connect(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('CONNECT', path, h, ...m)
  }
  delete(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('DELETE', path, h, ...m)
  }
  get(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('GET', path, h, ...m)
  }
  head(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('HEAD', path, h, ...m)
  }
  options(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('OPTIONS', path, h, ...m)
  }
  patch(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('PATCH', path, h, ...m)
  }
  post(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('POST', path, h, ...m)
  }
  put(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('PUT', path, h, ...m)
  }
  trace(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    return this.add('TRACE', path, h, ...m)
  }
  any(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    const methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']
    for (const method of methods) {
      this.add(method, path, h, ...m)
    }
    return this
  }
  match(methods: string[], path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    for (const method of methods) {
      this.add(method, path, h, ...m)
    }
    return this
  }
  add(method: string, path: string, handler: handlerFunc, ...middleware: middlewareFunc[]) {
    this.router.add(method, path, c => {
      let h = handler
      for (const m of middleware) {
        h = m(h)
      }
      return h(c)
    })
    return this
  }
  group(prefix: string, ...m: middlewareFunc[]) {
    console.error(`abc.group: ${notImplemented().message}`)
    return this
  }
  static(prefix: string, root: string) {
    console.error(`abc.static: ${notImplemented().message}`)
    return this
  }
  private transformResult(c: Context, result: any) {
    if (result !== undefined) {
      switch (typeof result) {
        case 'object':
          c.json(result)
          break
        case 'string':
          ;/^\s*</.test(result) ? c.html(result) : c.string(result)
          break
        default:
          c.string(result)
      }
    }
  }
}

export type handlerFunc = (c: Context) => any
export type middlewareFunc = (h: handlerFunc) => handlerFunc

export const NotFoundHandler: handlerFunc = c => {
  c.response.status = Status.NotFound
  c.response.body = new TextEncoder().encode(STATUS_TEXT.get(Status.NotFound))
}

export function abc() {
  const abc = new AbcImpl() as Abc
  return abc
}

export class HttpError extends Error {
  code: number
  constructor(code: number, message?: any) {
    super(message)
    this.code = code
  }
}

export function notImplemented() {
  return new Error('Not Implemented')
}
