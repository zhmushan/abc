import { t } from "https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts";
import { assertEqual } from "https://deno.land/x/testing/testing.ts";
import { binder } from "binder.ts";
import { context } from "context.ts";

function injectContext(r = {}) {
  return context(r as any);
}

class Obj {
  foo?;
  bar?;
  constructor(obj = {} as Obj) {
    this.foo = obj.foo;
    this.bar = obj.bar;
  }
}

t("bind", async () => {
  const c = injectContext({
    body: () => new TextEncoder().encode("foo=foo"),
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    })
  });
  const obj = new Obj();
  await binder().bind(obj, c);
  assertEqual(obj, { foo: "foo", bar: undefined });
});
