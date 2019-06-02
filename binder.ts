import "./reflect.ts";
import { Context } from "./context.ts";
import { Status, STATUS_TEXT } from "./deps.ts";
import { Parser, ParserFunction } from "./parser.ts";
import { Type } from "./type.ts";

export const BINDER_PROP_TYPE_PAIRS = "abc:binder_prop_type_pairs";

function _bind<T>(
  data: Record<string, any>,
  types: Record<string, any>,
  instance: T
) {
  for (const key in types) {
    if (data.hasOwnProperty(key)) {
      if (typeof types[key] === "object") {
        instance[key] = {};
        _bind(data[key], types[key], instance[key]);
      } else if (typeof data[key] === types[key]) {
        instance[key] = data[key];
      } else {
        throw new Error(`${key} should be ${types[key]}`);
      }
    } else {
      throw new Error(`${key} is required`);
    }
  }
}

export async function bind<T>(cls: Type<T>, c: Context): Promise<T> {
  const req = c.request;
  const cType = req.headers.get("Content-Type");
  if (!cType) {
    return;
  }
  let data: Record<string, any>;
  const instance = new cls();
  const body = new TextDecoder().decode(await req.body());
  const types = Reflect.getMetadata(BINDER_PROP_TYPE_PAIRS, cls);

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
  _bind(data, types, instance);

  return instance;
}

export function Binder() {
  return function<T>(target: Type<T>) {
    const types = Reflect.getMetadata("design:paramtypes", target);
    const instance = new target(...types);
    const pairs = {};
    for (const key of Object.keys(instance)) {
      if (Reflect.hasMetadata(BINDER_PROP_TYPE_PAIRS, instance[key])) {
        pairs[key] = Reflect.getMetadata(BINDER_PROP_TYPE_PAIRS, instance[key]);
      } else {
        pairs[key] = typeof instance[key]();
      }
    }
    Reflect.defineMetadata(BINDER_PROP_TYPE_PAIRS, pairs, target);
  };
}
