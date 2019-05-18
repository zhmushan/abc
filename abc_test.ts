import { test, assertEquals } from "./dev_deps.ts";
import { Status } from "./deps.ts";
import { abc, NotFoundHandler } from "./abc.ts";
import {
  InternalServerErrorException,
  NotFoundException
} from "./http_exception.ts";
const { readFile } = Deno;

enum HttpMethods {
  Delete = "DELETE",
  Get = "GET",
  Post = "POST",
  Put = "PUT"
}

const addr = "127.0.0.1:8081";
const host = `http://${addr}`;
const app = abc();

test(async function AbcStatic() {
  app.static("/sample", "./sample/02_template");

  let res = await fetch(`${host}/sample/main.ts`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    new TextDecoder().decode(await readFile("./sample/02_template/main.ts"))
  );

  res = await fetch(`${host}/sample/`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    new TextDecoder().decode(await readFile("./sample/02_template/index.html"))
  );

  res = await fetch(`${host}/sample/empty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
});

test(async function AbcFile() {
  app.file("pipelines", "./azure-pipelines.yml");
  app.file("fileempty", "./fileempty");

  let res = await fetch(`${host}/pipelines`);
  assertEquals(res.status, Status.OK);
  assertEquals(
    await res.text(),
    new TextDecoder().decode(await readFile("./azure-pipelines.yml"))
  );

  res = await fetch(`${host}/fileempty`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
});

test(async function AbcMiddleware() {
  let str = "";
  app
    .pre(function(next) {
      return function(c) {
        str += "0";
        return next(c);
      };
    })
    .use(
      function(next) {
        return function(c) {
          str += "1";
          return next(c);
        };
      },
      function(next) {
        return function(c) {
          str += "2";
          return next(c);
        };
      },
      function(next) {
        return function(c) {
          str += "3";
          return next(c);
        };
      }
    )
    .get("/middleware", () => str);

  let res = await fetch(`${host}/middleware`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), str);
  assertEquals(str, "0123");
});

test(async function AbcMiddlewareError() {
  const errMsg = "err";
  app.get("/middlewareerror", NotFoundHandler, function() {
    return function() {
      throw new Error(errMsg);
    };
  });
  let res = await fetch(`${host}/middlewareerror`);
  assertEquals(res.status, Status.InternalServerError);
  assertEquals(
    await res.text(),
    JSON.stringify(new InternalServerErrorException(errMsg).response)
  );
});

test(async function AbcHandler() {
  app.get("/ok", () => "ok");
  let res = await fetch(`${host}/ok`);
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "ok");
});

test(async function AbcHttpMethods() {
  app
    .delete("/delete", () => "delete")
    .get("/get", () => "get")
    .post("/post", () => "post")
    .put("/put", () => "put")
    .any("/any", () => "any")
    .match(Object.values(HttpMethods), "/match", () => "match");

  let res = await fetch(`${host}/delete`, { method: HttpMethods.Delete });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "delete");

  res = await fetch(`${host}/get`, { method: HttpMethods.Get });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "get");

  res = await fetch(`${host}/post`, { method: HttpMethods.Post });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "post");

  res = await fetch(`${host}/put`, { method: HttpMethods.Put });
  assertEquals(res.status, Status.OK);
  assertEquals(await res.text(), "put");

  for (const key in HttpMethods) {
    res = await fetch(`${host}/any`, { method: HttpMethods[key] });
    assertEquals(res.status, Status.OK);
    assertEquals(await res.text(), "any");

    res = await fetch(`${host}/match`, { method: HttpMethods[key] });
    assertEquals(res.status, Status.OK);
    assertEquals(await res.text(), "match");
  }
});

test(async function NotFound() {
  app.get("/not_found_handler", NotFoundHandler);
  let res = await fetch(`${host}/not_found_handler`);
  assertEquals(res.status, Status.NotFound);
  assertEquals(
    await res.text(),
    JSON.stringify(new NotFoundException().response)
  );
});

app.start(addr);
