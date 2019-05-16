import "./reflect.ts";
import { Context } from "./context.ts";
import { Status, STATUS_TEXT } from "./deps.ts";
import { Parser, ParserFunction } from "./parser.ts";
import { Type } from "./type.ts";

export const BINDER_PROP_TYPE_PAIRS = "abc:binder_prop_type_pairs";

export async function bind<T>(cls: Type<T>, c: Context): Promise<T> {
  const req = c.request;
  const cType = req.headers.get("Content-Type");
  if (!cType) {
    return;
  }
  let data: Record<string, any>;
  const instance = new cls();
  const body = new TextDecoder().decode(await req.body());
  const pairs = Reflect.getMetadata(BINDER_PROP_TYPE_PAIRS, cls);

  let useFunc: ParserFunction;
  if (cType.includes("application/json")) {
    useFunc = "json";
  } else if (cType.includes("application/x-www-form-urlencoded")) {
    useFunc = "urlencoded";
  } else if (cType.includes("multipart/form-data")) {
    useFunc = "multipart";
  }
  if (!useFunc) {
    throw new Error(STATUS_TEXT.get(Status.UnsupportedMediaType));
  }
  data = Parser[useFunc](body);
  for (const key in pairs) {
    if (!data.hasOwnProperty(key)) {
      throw new Error(`${key} is required`);
    } else if (typeof data[key] !== pairs[key]) {
      throw new Error(`${key} should be ${pairs[key]}`);
    }
    instance[key] = data[key];
  }
  return instance;
}

export function Binder() {
  return function<T>(target: Type<T>) {
    const types = Reflect.getMetadata("design:paramtypes", target);
    const instance = new target(...types);
    const pairs = {};
    for (const key of Object.keys(instance)) {
      pairs[key] = typeof instance[key]();
    }
    Reflect.defineMetadata(BINDER_PROP_TYPE_PAIRS, pairs, target);
  };
}
