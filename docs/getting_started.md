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
function track(next: HandlerFunc) {
  return function(c: Context) {
    console.log(`request to ${c.path}`);
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
