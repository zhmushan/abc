## Logger

Logger logs the information about each HTTP request.

### Usage

```ts
const app = abc();
app.use(logger());
```

### Default Configuration

```ts
export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  formatter: DefaultFormatter,
  output: Deno.stdout
};
```

### Default Formatter

```ts
export const DefaultFormatter: Formatter = c => {
  const req = c.request;

  const time = new Date().toISOString();
  const method = req.method;
  const url = req.url || "/";
  const protocol = c.request.proto;

  return `${time} ${method} ${url} ${protocol}\n`;
};
```
