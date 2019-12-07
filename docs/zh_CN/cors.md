## 跨域

`CORS` 是一种机制，允许从另一个域请求资源，从而启用安全的跨域数据传输。

### 用法

```ts
const config: CORSConfig = {
  allowOrigins: ["https://a.com", "https://b.com", "https://c.com"],
  allowMethods: [HttpMethod.Get]
};
const app = abc();
app.use(cors(config));
```

### 默认配置

```ts
export const DefaultCORSConfig: CORSConfig = {
  skipper: DefaultSkipper,
  allowOrigins: ["*"],
  allowMethods: [
    HttpMethod.Delete,
    HttpMethod.Get,
    HttpMethod.Head,
    HttpMethod.Patch,
    HttpMethod.Post,
    HttpMethod.Put
  ]
};
````