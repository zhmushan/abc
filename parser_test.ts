import { t } from "https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts";
import { Parser } from "parser.ts";
import { assertEqual } from "https://deno.land/x/testing/testing.ts";

t("form", () => {
  const formCases: [[string, {}]] = [[`foo=bar`, { foo: "bar" }]];
  for (const c of formCases) {
    assertEqual(Parser.form(c[0]), [c[1], undefined]);
  }
});

t("json", () => {
  const jsonCases: [[string, {}]] = [[`{"foo": "bar"}`, { foo: "bar" }]];
  for (const c of jsonCases) {
    assertEqual(Parser.json(c[0]), [c[1], undefined]);
  }
});
