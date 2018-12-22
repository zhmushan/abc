import { t } from 'https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts'
import { context } from './context'

export function injectContext() {
  return context({} as any)
}

t('context', () => {})
