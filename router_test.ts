import { test, assertEquals } from "./dev_deps.ts";
import { context } from "./context.ts";
import { Router } from "./router.ts";

test({
  name: "router",
  async fn() {
    const r = new Router();
    r.add("GET", "/hello", async c => true);
    let c = context({} as any);
    assertEquals(await r.find("GET", "/hello", c)(c), true);

    r.add("GET", "/hello/:p", async c => true);
    c = context({} as any);
    assertEquals(await r.find("GET", "/hello/a", c)(c), true);
    assertEquals(await r.find("GET", "/hello/b", c)(c), true);
    assertEquals(await r.find("GET", "/hello/a/a", c), undefined);
  }
});
