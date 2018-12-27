import { assertEqual } from "https://deno.land/x/testing/testing.ts";
import { t } from "https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts";
import { Router } from "router.ts";
import { context } from "context.ts";

t("router", async () => {
  const r = new Router();
  r.add("GET", "/hello", async c => true);
  let c = context({} as any);
  assertEqual(await r.find("GET", "/hello", c)(c), true);

  r.add("GET", "/hello/:p", async c => true);
  c = context({} as any);
  assertEqual(await r.find("GET", "/hello/a", c)(c), true);
  assertEqual(await r.find("GET", "/hello/b", c)(c), true);
  assertEqual(await r.find("GET", "/hello/a/a", c), undefined);
});
