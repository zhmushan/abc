import { t } from 'https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts'
import { Parser } from './parser'
import { assertEqual } from 'https://deno.land/x/testing/testing.ts'

const formCases: [[string, {}]] = [[`foo=bar`, { foo: 'bar' }]]

t('parse form', () => {
  for (const c of formCases) {
    assertEqual(Parser.form(c[0]), [c[1], undefined])
  }
})
