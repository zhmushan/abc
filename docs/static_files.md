## Static Files

`static` registers a new route with path prefix to serve static files from the provided root directory. For example, a request to `/static/js/main.js` will fetch and serve `assets/js/main.js` file.

```ts
app.static("/static", "assets");
```

`abc.file()` registers a new route with path to serve a static file.

```ts
app.file("/", "public/index.html");
```
