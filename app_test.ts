// TODO: waiting for denoland/deno#4297
// import type { HandlerFunc } from "./types.ts";
import { HandlerFunc } from "./types.ts";

import { assertEquals, runIfMain } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { createApplication } from "./test_util.ts";
import { NotFoundHandler } from "./app.ts";
import {
  InternalServerErrorException,
  NotFoundException
} from "./http_exception.ts";
import { HttpMethod } from "./constants.ts";
const { readFile, test } = Deno;

const decoder = new TextDecoder();
const addr = `http://localhost:8081`;

test(async function AppStatic(): Promise<void> {
  const app = createApplication();
  app.static("/examples", "./examples/template");

  let res = await fetch(`${addr}/examples/main.ts`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./examples/template/main.ts")),
  );

  res = await fetch(`${addr}/examples/`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./examples/template/index.html")),
  );

  res = await fetch(`${addr}/examples/empty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response),
  );
  await app.close();
});

test(async function AppFile(): Promise<void> {
  const app = createApplication();
  app.file("ci", "./.github/workflows/ci.yml");
  app.file("fileempty", "./fileempty");

  let res = await fetch(`${addr}/ci`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    decoder.decode(await readFile("./.github/workflows/ci.yml")),
  );

  res = await fetch(`${addr}/fileempty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response),
  );
  await app.close();
});

test(async function AppMiddleware(): Promise<void> {
  const app = createApplication();
  let str = "";
  app
    .pre((next) =>
      (c) => {
        str += "0";
        return next(c);
      }
    )
    .use(
      (next) =>
        (c) => {
          str += "1";
          return next(c);
        },
      (next) =>
        (c) => {
          str += "2";
          return next(c);
        },
      (next) =>
        (c) => {
          str += "3";
          return next(c);
        },
    )
    .get("/middleware", () => str);

  const res = await fetch(`${addr}/middleware`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), str);
  assertEquals(str, "0123");
  await app.close();
});

test(async function AppMiddlewareError(): Promise<void> {
  const app = createApplication();
  const errMsg = "err";
  app.get("/middlewareerror", NotFoundHandler, function (): HandlerFunc {
    return function (): HandlerFunc {
      throw new Error(errMsg);
    };
  });

  const res = await fetch(`${addr}/middlewareerror`);
  assertEquals(res.status, Status.InternalServerError);
  assertEquals(
    await res.text(),
    JSON.stringify(new InternalServerErrorException(errMsg).response),
  );
  await app.close();
});

test(async function AppHandler(): Promise<void> {
  const app = createApplication();
  app.get("/ok", (): string => "ok");

  const res = await fetch(`${addr}/ok`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "ok");
  await app.close();
});

test(async function AppHttpMethods(): Promise<void> {
  const app = createApplication();
  app
    .delete("/delete", (): string => "delete")
    .get("/get", (): string => "get")
    .post("/post", (): string => "post")
    .put("/put", (): string => "put")
    .any("/any", (): string => "any")
    .match(Object.values(HttpMethod), "/match", (): string => "match");

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
  await app.close();
});

test(async function AppNotFound(): Promise<void> {
  const app = createApplication();
  app.get("/not_found_handler", NotFoundHandler);

  const res = await fetch(`${addr}/not_found_handler`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response),
  );
  await app.close();
});

test(async function AppQS(): Promise<void> {
  const app = createApplication();
  app.get("/qs", (c) => c.queryParams);
  const res = await fetch(`${addr}/qs?foo=bar`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.json(), { foo: "bar" });
  await app.close();
});

runIfMain(import.meta);
