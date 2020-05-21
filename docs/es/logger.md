## Logger

Logger registra la informacion de cada solicitud HTTP.

### Uso

```ts
import { Application } from "https://deno.land/x/abc/mod.ts";
import { logger } from "https://deno.land/x/abc/middleware/logger.ts";

const app = new Application();
app.use(logger());
```

### Configuracion por defecto

```ts
export const DefaultLoggerConfig: LoggerConfig = {
  skipper: DefaultSkipper,
  formatter: DefaultFormatter,
  output: Deno.stdout
};
```

### Formateador predeterminado

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
