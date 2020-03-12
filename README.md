# Abc

> **A** **b**etter Deno framework to **c**reate web application

[![tag](https://img.shields.io/github/tag/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![Build Status](https://github.com/zhmushan/abc/workflows/ci/badge.svg?branch=master)](https://github.com/zhmushan/abc/actions)
[![license](https://img.shields.io/github/license/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![tag](https://img.shields.io/badge/deno-v0.36.0-green.svg)](https://github.com/denoland/deno)

#### Quick links

- [Guides](https://deno.land/x/abc/docs/table_of_contents.md)
- [Examples](https://deno.land/x/abc/examples/README.md)

## Hello World

```ts
import { Application } from "https://deno.land/x/abc/mod.ts";

const app = new Application();

app
  .get("/hello", c => {
    return "Hello, Abc!";
  })
  .start({ port: 8080 });
```
