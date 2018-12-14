# Abc

> **A** **b**etter Deno framework to **c**reate web application

![Build Status](https://api.travis-ci.org/zhmushan/abc.svg?branch=master)

## Hello World

```ts
import { Abc } from 'https://deno.land/x/net/abc/index.ts'

const abc = new Abc()
abc.get('/hello', c => {
  return 'Hello World'
})
abc.start('0.0.0.0:8080')
```

## Getting Started

- [tutorial](https://github.com/zhmushan/abc/wiki)
