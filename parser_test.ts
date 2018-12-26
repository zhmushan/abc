import { t } from "https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts";
import { Parser } from "parser.ts";
import { assertEqual } from "https://deno.land/x/testing/testing.ts";

t("parser urlencoded", () => {
  const urlencodedCases: [[string, {}]] = [[`foo=bar`, { foo: "bar" }]];
  for (const c of urlencodedCases) {
    assertEqual(Parser.urlencoded(c[0]), [c[1], undefined]);
  }
});

t("parser json", () => {
  const jsonCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
  for (const c of jsonCases) {
    assertEqual(Parser.json(c[0]), [c[1], undefined]);
  }
});

// t("parser multipart", () => {
//   const multipartCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
//   for (const c of multipartCases) {
//     assertEqual(Parser.multipart(c[0]), [c[1], undefined]);
//   }
// });
