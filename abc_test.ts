import { test, assertEquals } from "./dev_deps.ts";
import { abc } from "./abc.ts";

const data = {
  string: "hello, world",
  html: "<h1>hello, world</h1>",
  json: { hello: "world" },
  undefined: "undefined"
};

test({
  name: "abc handler",
  async fn(): void {
    const app = abc();
    app
      .any("/string", () => data.string)
      .any("/html", () => data.html)
      .any("/json", () => data.json)
      .any("/undefined_0", () => undefined)
      .any("/undefined_1", c => {
        c.string(data.undefined);
      })
      .static("/sample/*files")
      .start("0.0.0.0:4500");

    let res = await fetch("http://localhost:4500/string");
    assertEquals(res.status, 200);
    assertEquals(
      new TextDecoder().decode(await res.arrayBuffer()),
      data.string
    );

    res = await fetch("http://localhost:4500/html");
    assertEquals(res.status, 200);
    assertEquals(new TextDecoder().decode(await res.arrayBuffer()), data.html);

    res = await fetch("http://localhost:4500/json");
    assertEquals(res.status, 200);
    assertEquals(
      new TextDecoder().decode(await res.arrayBuffer()),
      JSON.stringify(data.json)
    );

    res = await fetch("http://localhost:4500/undefined_0");
    assertEquals(res.status, 200);
    assertEquals(new TextDecoder().decode(await res.arrayBuffer()), "");

    res = await fetch("http://localhost:4500/undefined_1");
    assertEquals(res.status, 200);
    assertEquals(
      new TextDecoder().decode(await res.arrayBuffer()),
      data.undefined
    );

    res = await fetch("http://localhost:4500/sample/01_cat_app/cat.ts");
    assertEquals(res.status, 200);
    assertEquals(
      new TextDecoder().decode(await res.arrayBuffer()),
      new TextDecoder().decode(
        await Deno.readFile("./sample/01_cat_app/cat.ts")
      )
    );
  }
});
