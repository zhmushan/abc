import { test, assertEquals } from "./dev_deps.ts";
import { binder } from "./binder.ts";
import { context } from "./context.ts";

interface FakeServerRequest {
  body: () => Uint8Array;
  headers: Headers;
}

function injectContext(r: FakeServerRequest) {
  return context({ r: r as any });
}

class Obj {
  foo?;
  bar?;
  constructor(obj = {} as Obj) {
    this.foo = obj.foo;
    this.bar = obj.bar;
  }
}

test({
  name: "binder urlencoded",
  async fn() {
    const c = injectContext({
      body: () => new TextEncoder().encode("foo=foo"),
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded"
      })
    });
    const obj = new Obj();
    await binder().bind(obj, c);
    assertEquals(obj, { foo: "foo", bar: undefined });
  }
});

test({
  name: "binder json",
  async fn() {
    const c = injectContext({
      body: () => new TextEncoder().encode(`{"foo": "foo"}`),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });
    const obj = new Obj();
    await binder().bind(obj, c);
    assertEquals(obj, { foo: "foo", bar: undefined });
  }
});

// test({
//   name: "binder multipart",
//   async fn() {
//     const c = injectContext({
//       body: () => new TextEncoder().encode("foo=foo"),
//       headers: new Headers({
//         "Content-Type": "multipart/form-data"
//       })
//     });
//     const obj = new Obj();
//     await binder().bind(obj, c);
//     assertEquals(obj, { foo: "foo", bar: undefined });
//   }
// });
