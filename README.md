# Abc

> **A** **b**etter Deno framework to **c**reate web application

[![tag](https://img.shields.io/github/tag/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![Build Status](https://img.shields.io/travis/zhmushan/abc.svg)](https://travis-ci.org/zhmushan/abc)
[![license](https://img.shields.io/github/license/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![tag](https://img.shields.io/badge/deno__std-v0.3.4-green.svg)](https://github.com/denoland/deno_std)
[![tag](https://img.shields.io/badge/deno-v0.3.7-green.svg)](https://github.com/denoland/deno)

#### Quick links

[Documentation, demos, and guides](docs/table_of_contents.md)

## Hello World

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

## Routing

```ts
app
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .delete("/users/:id", deleteUser);
```

## Path Parameters

```ts
// app.get("/users/:id", getUser)
function getUser(c: Context) {
  // User ID from path `users/:id`
  const { id } = c.param;
  return id;
}
```

Browse to http://localhost:8080/users/zhmushan and you should see "zhmushan" on the page.

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
