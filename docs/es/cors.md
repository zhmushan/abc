## CORS

`CORS` es el sistema que permite la transferencia de recursos de un dominio a otro, este permite la transferencia segura datos.

### Uso de CORS

```ts
// crea un objeto de configuración y pasalo como parametro a la funcion cors

const config: CORSConfig = {
  allowOrigins: ["https://a.com", "https://b.com", "https://c.com"],
  allowMethods: [HttpMethod.Get],
};
const app = new Application();
app.use(cors(config));
```

### Configuración Por Defecto

```ts
// puedes pasarle la configuracion por defecto a la funcion cors

export const DefaultCORSConfig: CORSConfig = {
  skipper: DefaultSkipper,
  allowOrigins: ["*"],
  allowMethods: [
    HttpMethod.Delete,
    HttpMethod.Get,
    HttpMethod.Head,
    HttpMethod.Patch,
    HttpMethod.Post,
    HttpMethod.Put,
  ],
};
```
