import { middlewareFunc } from '../abc'

export const response: middlewareFunc = h => c => {
  const res = h(c)
  if (res) {
    switch (typeof res) {
      case 'object':
        c.json(res)
        break
      case 'string':
        ;/^\s*</.test(res) ? c.html(res) : c.string(res)
        break
      default:
        c.string(res)
    }
  }
}
