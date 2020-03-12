## Middleware

Middleware is a function which is called around the route handler. Middleware functions have access to the `request` and `response` objects.

Let's start by implementing a simple middleware feature.

```ts
const track: MiddlewareFunc = next => c => {
  console.log(`request to ${c.path}`);
  return next(c);
};
```

## Levels

- Root Level: Root level middleware is executed before router processes the request. It can be registered via `pre`.

- Group Level: When creating a new group, you can register middleware just for that group.

- Route Level: When defining a new route, you can optionally register middleware just for it.

## Skipper

There are cases when you would like to skip a middleware based on some conditions, for that each middleware has an option to define a function `skipper(c: Context): boolean`.

```ts
const app = new Application();
app.use(
  logger({
    skipper: c => {
      return c.path.startsWith("/skipper");
    }
  })
);
```
