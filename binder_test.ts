import { test, assertEquals, assertThrowsAsync } from "./dev_deps.ts";
import { Binder, BINDER_PROP_TYPE_PAIRS, bind } from "./binder.ts";
import { context } from "./context.ts";

interface FakeServerRequest {
  body: () => Uint8Array;
  headers: Headers;
}

function injectContext(r: FakeServerRequest) {
  return context({ r: r as any });
}

@Binder()
class A {
  public _foo: string;
  public _bar: number;
  constructor(public foo: string, public bar: number) {}
}

@Binder()
class B {
  constructor(public num: number, public a: A) {}
}

@Binder()
class Any {
  constructor(public field1: any) {}
}

test(function BinderDecorator() {
  assertEquals(Reflect.getMetadata(BINDER_PROP_TYPE_PAIRS, A), {
    foo: "string",
    bar: "number"
  });

  assertEquals(Reflect.getMetadata(BINDER_PROP_TYPE_PAIRS, Any), {
    field1: "any"
  });
});

test(async function BindJSON() {
  const data = [
    {
      foo: "foo",
      bar: 1024,
      _foo: "_foo",
      _bar: 1024
    },
    {
      foo: 1024,
      bar: 1024
    },
    {
      foo: "foo",
      bar: "bar"
    },
    {
      foo: "foo"
    }
  ];

  const sample = new A("foo", 1024);
  let ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[0])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  const instance = await bind(A, ctx);
  assertEquals(instance, sample);

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[1])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertThrowsAsync(
    async () => {
      await bind(A, ctx);
    },
    Error,
    "foo should be string"
  );

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[2])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertThrowsAsync(
    async () => {
      await bind(A, ctx);
    },
    Error,
    "bar should be number"
  );

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[3])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertThrowsAsync(
    async () => {
      await bind(A, ctx);
    },
    Error,
    "bar is required"
  );
});

test(async function BindNestingJSON() {
  const data = [
    { num: 1, a: { _foo: "foo", foo: "foo", bar: 123 } },
    { num: 1, a: { _foo: "foo", foo: "foo", bar: "bar" } }
  ];

  const sample = new B(1, new A("foo", 123));
  let ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[0])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  const instance = await bind(B, ctx);
  assertEquals(instance, sample);

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[1])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertThrowsAsync(
    async () => {
      await bind(B, ctx);
    },
    Error,
    "bar should be number"
  );
});

test(async function BindFieldWithAny() {
  const data = [
    {
      field1: "1"
    },
    {
      field1: 1
    },
    {}
  ];

  let ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[0])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertEquals(await bind(Any, ctx), new Any("1"));

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[1])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertEquals(await bind(Any, ctx), new Any(1));

  ctx = injectContext({
    body: () => new TextEncoder().encode(JSON.stringify(data[2])),
    headers: new Headers({ "Content-Type": "application/json" })
  });
  assertThrowsAsync(
    async () => {
      await bind(Any, ctx);
    },
    Error,
    "field1 is required"
  );
});
