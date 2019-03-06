## Hello World

```ts
import { abc } from "https://deno.sh/abc/mod.ts";
// Or import { abc } from "https://deno.land/x/abc/mod.ts";

const app = abc();

app
  .get("/hello", c => {
    return "Hello, Abc!";
  })
  .start("0.0.0.0:8080");
```

## 路由

```ts
app
  .get("/", findAll)
  .get("/:id", findOne)
  .post("/", create)
  .delete("/users/:id", deleteUser);
```

## 路径参数

```ts
// app.get("/users/:id", getUser)
function getUser(c: Context) {
  // User ID from path `users/:id`
  const { id } = c.param;
  return id;
}
```

从浏览器访问 http://localhost:8080/users/zhmushan 可以看到页面上显示 "zhmushan".

## 静态资源

将 static 作为静态资源目录.

```ts
app.static("/static/*files");
```

## 中间件

```ts
import { logger } from "https://deno.sh/abc/middleware.ts";

// 顶级中间件, 在路由注册之前运行
app.use(logger());
```

## Testing
