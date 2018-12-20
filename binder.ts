import { Context } from './context'
import { HttpError, notImplemented } from './abc'
import { Status } from './package'
import { Parser } from './parser'

export interface Binder {
  bind<T extends object>(cls: T, c: Context): Promise<Error>
}

class BinderImpl implements Binder {
  async bind<T extends object>(cls: T, c: Context): Promise<Error> {
    let err: Error
    const req = c.request
    const body = new TextDecoder().decode(await req.body())
    const cType = req.headers.get('Content-Type')
    if (cType.includes('application/json')) {
      let data: {}
      ;[data, err] = Parser.json(body)
      if (err) {
        return err
      }
      for (const key of Reflect.ownKeys(cls)) {
        cls[key] = data[key]
      }
    } else if (cType.includes('application/xml')) {
      return notImplemented()
    } else if (cType.includes('application/x-www-form-urlencoded')) {
      return notImplemented()
    } else {
      return new HttpError(Status.UnsupportedMediaType)
    }
    return err
  }
}

export function binder() {
  const binder = new BinderImpl() as Binder
  return binder
}
