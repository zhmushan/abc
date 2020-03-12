## Hello World

Create `server.ts`

```ts
import { Application } from "https://deno.land/x/abc/mod.ts";

const app = new Application();

app
  .get("/hello", c => {
    return "Hello, Abc!";
  })
  .start({ port: 8080 });
```

Start server

```sh
$ deno run --allow-net ./server.ts
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
const findOne: HandlerFunc = c => {
  // User ID from path `users/:id`
  const { id } = c.params;
  return id;
};
// app.get("/users/:id", findOne);
```

Browse to http://localhost:8080/users/zhmushan and you should see "zhmushan" on the page.

## Query Parameters

`/list?page=0&size=5`

```ts
const paging: HandlerFunc = c => {
  // Get page and size from the query string
  const { page, size } = c.queryParams;
  return `page: ${page}, size: ${size}`;
};
// app.get("/list", paging);
```

Browse to http://localhost:8080/list?page=0&size=5 and you should see "page: 0, size: 5" on the page.

## Static Content

Serve any file from `./folder/sample` directory for path `/sample/*`.

```ts
app.static("/sample", "./folder/sample");
```

## Middleware

```ts
const track: MiddlewareFunc = next => c => {
  console.log(`request to ${c.path}`);
  return next(c);
};

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
