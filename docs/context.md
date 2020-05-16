## Context

### Use a custom context

```ts
// Define `CustomContext`
class CustomContext extends Context {
  constructor(c: Context) {
    super(c);
  }

  hello() {
    this.string("Hello World!");
  }
}

// Replace the original `Context`
app.pre((next) => (c) => {
  const cc = new CustomContext(c);
  return next(cc);
});

app.get("/", (c) => {
  const cc: CustomContext = c.customContext!;
  cc.hello();
});

app.start({ port: 8080 });
```

Browse to http://localhost:8080 and you should see "Hello World!" on the page.
