## CORS

`CORS` is a mechanism that allows resources to be requested from another domain, which enable secure cross-domain
data transfers.

### Usage

```ts
const config: CORSConfig = {
  allowOrigins: ["https://a.com", "https://b.com", "https://c.com"],
  allowMethods: [HttpMethod.Get]
};
const app = new Application();
app.use(cors(config));
```

### Default Configuration

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
```
