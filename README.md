# Abc

> **A** **b**etter Deno framework to **c**reate web application

[![tag](https://img.shields.io/github/tag/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![Build Status](https://dev.azure.com/zhmushan/abc/_apis/build/status/zhmushan.abc?branchName=master)](https://dev.azure.com/zhmushan/abc/_build/latest?definitionId=2?branchName=master)
[![license](https://img.shields.io/github/license/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![tag](https://img.shields.io/badge/deno__std-v0.4.0-green.svg)](https://github.com/denoland/deno_std)
[![tag](https://img.shields.io/badge/deno-v0.4.0-green.svg)](https://github.com/denoland/deno)

#### Quick links

[Documentation, demos, and guides](docs/table_of_contents.md)

## Hello World

Create `server.ts`

```ts
import { abc } from "https://deno.sh/abc/mod.ts";
// OR import { abc } from "https://deno.land/x/abc/mod.ts";

const app = abc();

app
  .get("/hello", c => {
    return "Hello, Abc!";
  })
  .start("0.0.0.0:8080");
```

Start server

```sh
$ deno --allow-net ./server.ts
```

Browse to http://localhost:8080/hello and you should see Hello, Abc! on the page.

## Routing

```ts
app
  .get("/users/", findAll)
  .get("/users/:id", findOne)
  .post("/users/", create)
  .delete("/users/:id", deleteOne);
```

## Path Parameters

```ts
// app.get("/users/:id", findOne)
function findOne(c: Context) {
  // User ID from path `users/:id`
  const { id } = c.params;
  return id;
}
```

Browse to http://localhost:8080/users/zhmushan and you should see "zhmushan" on the page.

## Query Parameters

`/list?page=0&size=5`

```ts
// app.get("/list", paging)
function paging(c: Context) {
  // Get page and size from the query string
  const { page, size } = c.queryParams;
  return `page: ${page}, size: ${size}`;
}
```

Browse to http://localhost:8080/list?page=0&size=5 and you should see "page: 0, size: 5" on the page.

## Static Content

Serve any file from static directory.

```ts
app.static("/static/*files");
```

## Middleware

```ts
import { logger } from "https://deno.sh/abc/middleware.ts";

// Root middleware
app.use(logger());
```
