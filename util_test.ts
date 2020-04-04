import { assertEquals } from "./dev_deps.ts";
import { contentType } from "./util.ts";
import { MIME } from "./constants.ts";
const { test } = Deno;

test(function UtilContentType(): void {
  assertEquals(contentType("/path/to/file"), undefined);
  assertEquals(contentType("/path/to/file.md"), MIME.TextMarkdown);
  assertEquals(contentType("/path/to/file.html"), MIME.TextHTML);
  assertEquals(contentType("/path/to/file.htm"), MIME.TextHTML);
  assertEquals(contentType("/path/to/file.json"), MIME.ApplicationJSON);
  assertEquals(contentType("/path/to/file.map"), MIME.ApplicationJSON);
  assertEquals(contentType("/path/to/file.txt"), MIME.TextPlain);
  assertEquals(contentType("/path/to/file.ts"), MIME.ApplicationTypeScript);
  assertEquals(contentType("/path/to/file.tsx"), MIME.ApplicationTypeScript);
  assertEquals(contentType("/path/to/file.js"), MIME.ApplicationJavaScript);
  assertEquals(contentType("/path/to/file.jsx"), MIME.ApplicationJavaScript);
  assertEquals(contentType("/path/to/file.gz"), MIME.ApplicationGZip);
});
