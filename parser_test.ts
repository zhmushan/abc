import { test, assertEquals, assertThrows } from "./dev_deps.ts";
import { Parser } from "./parser.ts";
import { MIME } from "./constants.ts";

test(function ParseUrlencoded(): void {
  const parser = new Parser(MIME.ApplicationForm);
  const cases: Array<[string, Record<string, any>]> = [
    [`foo=bar`, { foo: "bar" }]
  ];
  for (const c of cases) {
    assertEquals(parser.parse(c[0]), c[1]);
  }
});

test(function ParseJSON(): void {
  const parser = new Parser(MIME.ApplicationJSON);
  const cases: Array<[string, Record<string, any>]> = [
    [`{"foo": "bar"}`, { foo: "bar" }]
  ];
  for (const c of cases) {
    assertEquals(parser.parse(c[0]), c[1]);
  }
});

test(function ParseMultipart(): void {
  const parser = new Parser(MIME.MultipartForm);
  assertThrows(
    (): void => {
      parser.parse("");
    },
    Error,
    "Not Implemented"
  );
});
