import { serve, Status, STATUS_TEXT } from './package'
import { Context } from './context'
import { Router, Node } from './router'
import { logger, response } from './middleware/index'

export class Abc {
  router: Router
  middleware: middlewareFunc[]
  preMiddleware: middlewareFunc[]

  constructor() {
    this.router = new Router()
    this.middleware = []

    this.use(response)
  }

  async start(addr: string) {
    const s = serve(addr)

    // Print all routes that added
    function nestNode(n: Node) {
      console.log(n)
      for (const nc of n.children) {
        if (nc.children) {
          nestNode(nc)
        }
      }
    }
    for (const t of this.router.trees) {
      console.log(t[0])
      nestNode(t[1])
    }

    for await (const req of s) {
      const c = new Context(req)
      let h = this.router.find(req.method, req.url, c) || NotFoundHandler
      for (const m of this.middleware) {
        h = m(h)
      }
      h(c)
      await req.respond(c.response)
    }
  }

  use(...m: middlewareFunc[]) {
    this.middleware.push(...m)
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
  add(method: string, path: string, handler: handlerFunc, ...middleware: middlewareFunc[]) {
    this.router.add(method, path, c => {
      let h = handler
      for (const m of middleware) {
        h = m(h)
      }
      return h(c)
    })
  }
}

export type handlerFunc = (c: Context) => any
export type middlewareFunc = (h: handlerFunc) => handlerFunc

export const NotFoundHandler: handlerFunc = c => {
  c.response.status = Status.NotFound
  c.response.body = new TextEncoder().encode(STATUS_TEXT.get(Status.NotFound))
}
