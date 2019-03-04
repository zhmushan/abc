import { Parser } from "./parser.ts";
import { assertEqual, test } from "https://deno.land/x/testing/mod.ts";

test({
  name: "parser urlencoded",
  fn() {
    const urlencodedCases: [[string, {}]] = [[`foo=bar`, { foo: "bar" }]];
    for (const c of urlencodedCases) {
      assertEqual(Parser.urlencoded(c[0]), [c[1], undefined]);
    }
  }
});

test({
  name: "parser json",
  fn() {
    const jsonCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
    for (const c of jsonCases) {
      assertEqual(Parser.json(c[0]), [c[1], undefined]);
    }
  }
});

// test({
//   name: "parser multipart",
//   fn() {
//     const multipartCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
//     for (const c of multipartCases) {
//       assertEqual(Parser.multipart(c[0]), [c[1], undefined]);
//     }
//   }
// });
