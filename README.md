# Abc

> **A** **b**etter Deno framework to **c**reate web application

[![tag](https://img.shields.io/github/tag/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![Build Status](https://dev.azure.com/zhmushan/abc/_apis/build/status/zhmushan.abc?branchName=master)](https://dev.azure.com/zhmushan/abc/_build/latest?definitionId=2?branchName=master)
[![license](https://img.shields.io/github/license/zhmushan/abc.svg)](https://github.com/zhmushan/abc)
[![tag](https://img.shields.io/badge/deno__std-v0.20.0-green.svg)](https://github.com/denoland/deno_std)
[![tag](https://img.shields.io/badge/deno-v0.20.0-green.svg)](https://github.com/denoland/deno)

#### Quick links

- [Documentation, demos, and guides](docs/table_of_contents.md)
- [Benchmarks](benchmarks/RESULT)

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
