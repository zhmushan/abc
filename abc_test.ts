import { test, assertEqual } from 'https://deno.land/x/testing/testing.ts'
import { Abc, NotFoundHandler } from './abc'
import { Context } from './context'

const data = {
  string: 'hello, world',
  html: '<h1>hello, world</h1>',
  json: { hello: 'world' }
}

const methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']

test(function testHandler() {
  const abc = new Abc()

  // create a fake context
  let ctx = new Context({} as any)

  abc.any('/string', c => data.string)
  abc.any('/html', c => data.html)
  abc.any('/json', c => data.json)
  for (const method of methods) {
    assertEqual(abc.router.find(method, '/string', ctx)(ctx), data.string)
    assertEqual(abc.router.find(method, '/html', ctx)(ctx), data.html)
    assertEqual(abc.router.find(method, '/json', ctx)(ctx), data.json)
    assertEqual((abc.router.find(method, '/', ctx) || NotFoundHandler), NotFoundHandler)
  }
})
