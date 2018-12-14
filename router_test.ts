import { test, assertEqual } from 'https://deno.land/x/testing/testing.ts'
import { Router } from './router'
import { Context } from './context'

test(function testRouter() {
  const r = new Router()
  r.add('GET', '/hello', c => true)
  let c = new Context({} as any)
  assertEqual(r.find('GET', '/hello', c)(c), true)

  r.add('GET', '/hello/:p', c => true)
  c = new Context({} as any)
  assertEqual(r.find('GET', '/hello/a', c)(c), true)
  assertEqual(r.find('GET', '/hello/b', c)(c), true)
  assertEqual(r.find('GET', '/hello/a/a', c), undefined)
})
