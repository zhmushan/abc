# Abc

> **A** **b**etter Deno framework to **c**reate web application

[![DenoLib](https://denolib.com/badge?scope=zhmushan&repo=abc&style=flat-square)](https://denolib.com)
[![Build Status](https://img.shields.io/travis/zhmushan/abc.svg?style=flat-square)](https://travis-ci.org/zhmushan/abc)

#### Quick links

[Documentation, demos, and guides](docs/table_of_contents.md)

## Hello World

```ts
import { abc } from "https://deno.sh/abc/mod.ts";
// or import { abc } from "https://deno.land/x/abc/mod.ts";

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
