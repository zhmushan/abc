import { test, assertEquals } from "./dev_deps.ts";
import { context, Context } from "./context.ts";
import { Router } from "./router.ts";
import { handlerFunc } from "./abc.ts";

function injectContext(path: string) {
  return context({ url: new URL(path, "0.0.0.0:8080") });
}

type RouterAddParams = [string, string, handlerFunc];
type RouterFindParams = [string, Context];
type RouterFindParamsAndResult = [string, Context, any];

const caseGroups: [RouterAddParams, ...RouterFindParamsAndResult[]][] = [
  [["GET", "/hello", () => true], ["GET", injectContext("/hello"), true]],
  [
    ["GET", "/hello/:p", () => true],
    ["GET", injectContext("/hello/foo"), true],
    ["GET", injectContext("/hello/foobar"), true],
    ["GET", injectContext("/hello/foo/bar"), undefined]
  ]
];

test({
  name: "router",
  fn() {
    for (const g of caseGroups) {
      const r = new Router();
      r.add(...g[0]);
      for (let i = 1; i < g.length; ++i) {
        const params = [g[i][0], g[i][1]] as RouterFindParams;
        const handler = r.find(...params);
        const result = handler ? handler() : handler;
        assertEquals(result, g[i][2]);
      }
    }
  }
});
