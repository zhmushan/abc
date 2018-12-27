# Abc

> **A** **b**etter Deno framework to **c**reate web application

![Build Status](https://api.travis-ci.org/zhmushan/abc.svg?branch=master)

## Hello World

```ts
import { abc } from "https://deno.land/x/abc/index.ts";

abc()
  .get("/hello", async c => {
    return "Hello, Abc!";
  })
  .start("0.0.0.0:8080");
```

## Better Middleware And HandlerFunc Design

- The middleware passes through **return** instead of `next()`
- In the handler function, we can return the result directly, and `Abc` will automatically fill this result into response.

### Official Middleware

- [logger](https://github.com/zhmushan/abc_logger)

## More Powerful Context

Although it is not yet powerful, I hope it can provide a more convenient way to parse parameters.

## Abc's Route Really Fast.

Let us look forward to it.

## Contributing

We would love for you to contribute to Abc and help make it even better than it is today!

## Getting Started

- [tutorial](https://github.com/zhmushan/abc/wiki)
