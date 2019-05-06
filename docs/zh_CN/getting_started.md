## Hello World

创建 `server.ts`

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

启动服务

```sh
$ deno --allow-net ./server.ts
```

从浏览器访问 http://localhost:8080/hello 可以看到页面上显示 "Hello, Abc!".

## 路由

```ts
app
  .get("/users/", findAll)
  .get("/users/:id", findOne)
  .post("/users/", create)
  .delete("/users/:id", deleteOne);
```

## 路径参数

```ts
// app.get("/users/:id", findOne)
function findOne(c: Context) {
  // User ID from path `users/:id`
  const { id } = c.params;
  return id;
}
```

从浏览器访问 http://localhost:8080/users/zhmushan 可以看到页面上显示 "zhmushan".

## 查询参数

`/list?page=0&size=5`

```ts
// app.get("/list", paging)
function paging(c: Context) {
  // Get page and size from the query string
  const { page, size } = c.queryParams;
  return `page: ${page}, size: ${size}`;
}
```

从浏览器访问 http://localhost:8080/list?page=0&size=5 可以看到页面上显示 "page: 0, size: 5".

## 静态资源

将 static 作为静态资源目录.

```ts
app.static("/static/*files");
```

## 中间件

```ts
function track(next: handlerFunc) {
  return function(c: Context) {
    console.log("request to /users");
    return next(c);
  };
}

// Root middleware
app.use(logger());

// Group level middleware
const g = app.group("/admin");
g.use(track);

// Route level middleware
app.get(
  "/users",
  c => {
    return "/users";
  },
  track
);
```
