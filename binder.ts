import "./reflect.ts";
import { Context } from "./context.ts";
import { Status, STATUS_TEXT } from "./deps.ts";
import { Parser } from "./parser.ts";
import { Type } from "./type.ts";
import { Header } from "./constants.ts";
const { readAll } = Deno;

export const BinderPropTypeParis = "abc:binder_prop_type_pairs";
const Any = "any";
const decoder = new TextDecoder();

function _bind<T>(
  data: Record<string, any>,
  types: Record<string, any>,
  instance: T
): void {
  for (const key in types) {
    if (data.hasOwnProperty(key)) {
      if (typeof types[key] === "object") {
        instance[key] = {};
        _bind(data[key], types[key], instance[key]);
      } else if (typeof data[key] === types[key] || types[key] === Any) {
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
  const cType = req.headers.get(Header.ContentType);
  if (!cType) {
    return;
  }
  const instance = new cls();
  const body = decoder.decode(await readAll(req.body));
  const types = Reflect.getMetadata(BinderPropTypeParis, cls);

  const parser = new Parser(cType);
  const data = parser.parse(body);

  if (!data) throw new Error(STATUS_TEXT.get(Status.UnsupportedMediaType));
  _bind(data, types, instance);

  return instance;
}

export function Binder(): <T>(target: Type<T>) => void {
  return function<T>(target: Type<T>): void {
    const types = Reflect.getMetadata("design:paramtypes", target);
    const instance = new target(...types);
    const pairs = {};
    for (const key of Object.keys(instance)) {
      if (Reflect.hasMetadata(BinderPropTypeParis, instance[key])) {
        pairs[key] = Reflect.getMetadata(BinderPropTypeParis, instance[key]);
      } else {
        const fieldType = typeof instance[key]();
        if (fieldType === "object") {
          pairs[key] = Any;
        } else {
          pairs[key] = fieldType;
        }
      }
    }
    Reflect.defineMetadata(BinderPropTypeParis, pairs, target);
  };
}
