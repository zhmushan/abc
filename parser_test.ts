import { test, assertEquals, assertThrows } from "./dev_deps.ts";
import { Parser } from "./parser.ts";

test(function ParseUrlencoded(): void {
  const cases: Array<[string, Record<string, any>]> = [
    [`foo=bar`, { foo: "bar" }]
  ];
  for (const c of cases) {
    assertEquals(Parser.urlencoded(c[0]), c[1]);
  }
});

test(function ParseJSON(): void {
  const cases: Array<[string, Record<string, any>]> = [
    [`{"foo": "bar"}`, { foo: "bar" }]
  ];
  for (const c of cases) {
    assertEquals(Parser.json(c[0]), c[1]);
  }
});

test(function ParseMultipart(): void {
  assertThrows(
    () => {
      Parser.multipart("");
    },
    Error,
    "Not Implemented"
  );
});
