import { assertEqual } from "https://deno.land/x/testing/mod.ts";
import { t } from "https://raw.githubusercontent.com/zhmushan/deno_test/master/index.ts";
import { abc } from "abc.ts";
import { exit } from "deno";

const data = {
  string: "hello, world",
  html: "<h1>hello, world</h1>",
  json: { hello: "world" }
};

const methods = [
  "CONNECT",
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
  "TRACE"
];

t("abc handler", async () => {
  const app = abc();
  app
    .any("/string", async c => data.string)
    .any("/html", async c => data.html)
    .any("/json", async c => data.json)
    .start("0.0.0.0:4500");

  let res = await fetch("http://localhost:4500/string");
  assertEqual(res.status, 200);
  assertEqual(new TextDecoder().decode(await res.arrayBuffer()), data.string);

  res = await fetch("http://localhost:4500/html");
  assertEqual(res.status, 200);
  assertEqual(new TextDecoder().decode(await res.arrayBuffer()), data.html);

  res = await fetch("http://localhost:4500/json");
  assertEqual(res.status, 200);
  assertEqual(
    new TextDecoder().decode(await res.arrayBuffer()),
    JSON.stringify(data.json)
  );

  maybeCompleteTests();
});

function maybeCompleteTests() {
  setTimeout(() => {
    exit();
  }, 0);
}
