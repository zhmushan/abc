## Middleware

Middleware is a function which is called around the route handler. Middleware
functions have access to the `request` and `response` objects.

Let's start by implementing a simple middleware feature.

```ts
const track: MiddlewareFunc = (next) =>
  (c) => {
    console.log(`request to ${c.path}`);
    return next(c);
  };
```

### Levels

- Root Level:

  - `pre` can register middleware which executed before the router processes the
    request.
  - `use` can register middleware which executed after the router processes the
    request.

- Group Level: When creating a new group, we can register middleware just for
  that group.

- Route Level: When defining a new route, we can optionally register middleware
  just for it.

**Note: Once the `next` function is not returned, the middleware call will be
interrupted!**

There are always people who like to recite the calling order of middleware:

```ts
app.get(
  "/",
  () => {
    console.log(1);
  },
  (next) => {
    console.log(2);
    return (c) => {
      console.log(3);
      return next(c);
    };
  },
  (next) => {
    console.log(4);
    return (c) => {
      console.log(5);
      return next(c);
    };
  },
);

// output: 2, 4, 5, 3, 1
```

### Skipper

There are cases when you would like to skip a middleware based on some
conditions, for that each middleware has an option to define a function
`skipper(c: Context): boolean`.

```ts
const app = new Application();
app.use(
  logger({
    skipper: (c) => {
      return c.path.startsWith("/skipper");
    },
  }),
);
```
