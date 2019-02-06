import { Context } from "context.ts";
import { HttpError } from "abc.ts";
import { Status } from "package.ts";
import { Parser } from "parser.ts";

export interface Binder {
  bind<T extends object>(cls: T, c: Context): Promise<Error>;
}

class BinderImpl implements Binder {
  async bind<T extends object>(cls: T, c: Context): Promise<Error> {
    let data: {}, err: Error;
    const req = c.request;
    const body = new TextDecoder().decode(await req.body());
    const cType = req.headers.get("Content-Type");
    if (cType.includes("application/json")) {
      [data, err] = Parser.json(body);
      if (err) {
        return err;
      }
      for (const key of Reflect.ownKeys(cls)) {
        cls[key] = data[key];
      }
    } else if (cType.includes("application/x-www-form-urlencoded")) {
      [data, err] = Parser.urlencoded(body);
      if (err) {
        return err;
      }
      for (const key of Reflect.ownKeys(cls)) {
        cls[key] = data[key];
      }
    } else if (cType.includes("multipart/form-data")) {
      [data, err] = Parser.multipart(body);
      if (err) {
        return err;
      }
      for (const key of Reflect.ownKeys(cls)) {
        cls[key] = data[key];
      }
    } else {
      err = new HttpError(Status.UnsupportedMediaType);
    }
    return err;
  }
}

export function binder() {
  const binder = new BinderImpl() as Binder;
  return binder;
}
