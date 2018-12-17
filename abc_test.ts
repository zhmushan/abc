import { test, assertEqual } from 'https://deno.land/x/testing/testing.ts'
import { NotFoundHandler, abc } from './abc'
import { createContext } from './context'

const data = {
  string: 'hello, world',
  html: '<h1>hello, world</h1>',
  json: { hello: 'world' }
}

const methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']

test(function testHandler() {
  const app = abc()

  // create a fake context
  let ctx = createContext({} as any)

  app.any('/string', c => data.string)
  app.any('/html', c => data.html)
  app.any('/json', c => data.json)
  for (const method of methods) {
    assertEqual(app.router.find(method, '/string', ctx)(ctx), data.string)
    assertEqual(app.router.find(method, '/html', ctx)(ctx), data.html)
    assertEqual(app.router.find(method, '/json', ctx)(ctx), data.json)
    assertEqual(app.router.find(method, '/', ctx) || NotFoundHandler, NotFoundHandler)
  }
})
