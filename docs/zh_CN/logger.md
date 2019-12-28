## 日志

日志记录有关每个 HTTP 请求的信息。

### 用法

```ts
const app = abc();
app.use(logger());
```

### 默认配置

```ts
export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  formatter: DefaultFormatter,
  output: Deno.stdout
};
```

### 默认格式化程序

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
