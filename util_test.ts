import { assertEquals } from "./dev_deps.ts";
import { contentType } from "./util.ts";
import { MIME } from "./constants.ts";
const { test } = Deno;

test("util content type", function (): void {
  assertEquals(contentType("/path/to/file"), undefined);
  assertEquals(contentType("/path/to/file.md"), MIME.TextMarkdownCharsetUTF8);
  assertEquals(contentType("/path/to/file.html"), MIME.TextHTMLCharsetUTF8);
  assertEquals(contentType("/path/to/file.htm"), MIME.TextHTMLCharsetUTF8);
  assertEquals(contentType("/path/to/file.json"), MIME.ApplicationJSON);
  assertEquals(contentType("/path/to/file.map"), MIME.ApplicationJSON);
  assertEquals(contentType("/path/to/file.txt"), MIME.TextPlainCharsetUTF8);
  assertEquals(
    contentType("/path/to/file.ts"),
    MIME.ApplicationJavaScriptCharsetUTF8,
  );
  assertEquals(
    contentType("/path/to/file.tsx"),
    MIME.ApplicationJavaScriptCharsetUTF8,
  );
  assertEquals(
    contentType("/path/to/file.js"),
    MIME.ApplicationJavaScriptCharsetUTF8,
  );
  assertEquals(
    contentType("/path/to/file.jsx"),
    MIME.ApplicationJavaScriptCharsetUTF8,
  );
  assertEquals(contentType("/path/to/file.gz"), MIME.ApplicationGZip);
});
