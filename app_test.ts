import { assertEquals, runIfMain } from "./dev_deps.ts";
import { Status, HTTPOptions } from "./deps.ts";
import App, { NotFoundHandler } from "./app.ts";
import {
  InternalServerErrorException,
  NotFoundException
} from "./http_exception.ts";
import { HttpMethod } from "./constants.ts";
import { HandlerFunc } from "./types.ts";
const { readFile, test } = Deno;

const decoder = new TextDecoder();

const options: HTTPOptions = { port: 8081 };
const getaddr = () => `http://localhost:${options.port}`;

test(async function AppStatic(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app.static("/examples", "./examples/02_template");
  app.start(options);

  let res = await fetch(`${addr}/examples/main.ts`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./examples/02_template/main.ts"))
  );

  res = await fetch(`${addr}/examples/`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./examples/02_template/index.html"))
  );

  res = await fetch(`${addr}/examples/empty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
  app.close();
});

test(async function AppFile(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app.file("ci", "./.github/workflows/ci.yml");
  app.file("fileempty", "./fileempty");
  app.start(options);

  let res = await fetch(`${addr}/ci`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./.github/workflows/ci.yml"))
  );

  res = await fetch(`${addr}/fileempty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
  app.close();
});

test(async function AppMiddleware(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  let str = "";
  app
    .pre(next => c => {
      str += "0";
      return next(c);
    })
    .use(
      next => c => {
        str += "1";
        return next(c);
      },
      next => c => {
        str += "2";
        return next(c);
      },
      next => c => {
        str += "3";
        return next(c);
      }
    )
    .get("/middleware", () => str);
  app.start(options);

  const res = await fetch(`${addr}/middleware`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), str);
  assertEquals(str, "0123");
  app.close();
});

test(async function AppMiddlewareError(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  const errMsg = "err";
  app.get("/middlewareerror", NotFoundHandler, function(): HandlerFunc {
    return function(): HandlerFunc {
      throw new Error(errMsg);
    };
  });
  app.start(options);

  const res = await fetch(`${addr}/middlewareerror`);
  assertEquals(res.status, Status.InternalServerError);
  assertEquals(
    await res.text(),
    JSON.stringify(new InternalServerErrorException(errMsg).response)
  );
  app.close();
});

test(async function AppHandler(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app.get("/ok", (): string => "ok");
  app.start(options);

  const res = await fetch(`${addr}/ok`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "ok");
  app.close();
});

test(async function AppHttpMethods(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app
    .delete("/delete", (): string => "delete")
    .get("/get", (): string => "get")
    .post("/post", (): string => "post")
    .put("/put", (): string => "put")
    .any("/any", (): string => "any")
    .match(Object.values(HttpMethod), "/match", (): string => "match");
  app.start(options);

  let res = await fetch(`${addr}/delete`, { method: HttpMethod.Delete });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "delete");

  res = await fetch(`${addr}/get`, { method: HttpMethod.Get });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "get");

  res = await fetch(`${addr}/post`, { method: HttpMethod.Post });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "post");

  res = await fetch(`${addr}/put`, { method: HttpMethod.Put });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "put");

  for (const i of ["GET", "PUT", "POST", "PATCH", "DELETE"]) {
    res = await fetch(`${addr}/any`, { method: i });
    assertEquals(res.status, Status.OK);
    assertEquals(await res.text(), "any");
    res = await fetch(`${addr}/match`, { method: i });
    assertEquals(res.status, Status.OK);
    assertEquals(await res.text(), "match");
  }
  app.close();
});

test(async function AppNotFound(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app.get("/not_found_handler", NotFoundHandler);
  app.start(options);

  const res = await fetch(`${addr}/not_found_handler`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
  app.close();
});

test(async function AppQS(): Promise<void> {
  ++options.port;
  const addr = getaddr();

  const app = new App();
  app.get("/qs", c => c.queryParams).start(options);
  const res = await fetch(`${addr}/qs?foo=bar`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.json(), { foo: "bar" });
  app.close();
});

runIfMain(import.meta);
