import { Parser } from "./parser.ts";
import { assertEquals } from "https://deno.land/x/testing/asserts.ts";
import { test } from "https://deno.land/x/testing/mod.ts";

test({
  name: "parser urlencoded",
  fn() {
    const urlencodedCases: [[string, {}]] = [[`foo=bar`, { foo: "bar" }]];
    for (const c of urlencodedCases) {
      assertEquals(Parser.urlencoded(c[0]), [c[1], undefined]);
    }
  }
});

test({
  name: "parser json",
  fn() {
    const jsonCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
    for (const c of jsonCases) {
      assertEquals(Parser.json(c[0]), [c[1], undefined]);
    }
  }
});

// test({
//   name: "parser multipart",
//   fn() {
//     const multipartCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
//     for (const c of multipartCases) {
//       assertEquals(Parser.multipart(c[0]), [c[1], undefined]);
//     }
//   }
// });
