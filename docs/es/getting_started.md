## Hola Mundo con Abc

Crea un archivo `server.ts`

```ts
import { Application } from "https://deno.land/x/abc/mod.ts";

const app = new Application();

app
  .get("/hello", (c) => {
    return "Hola, Abc!";
  })
  .start({ port: 8080 });
```

inicia el servidor

```sh
$ deno run --allow-net ./server.ts
```

En su navegador acceda a la siguiente ruta http://localhost:8080/hello deberia ver `Hola, ABC` por pantalla.

## Enrutador

```ts
app
  .get("/users/", findAll)
  .get("/users/:id", findOne)
  .post("/users/", create)
  .delete("/users/:id", deleteOne);
```

## Parametros de rutas

```ts
const findOne: HandlerFunc = (c) => {
  // el ID viene de la ruta `user/:id`
  const { id } = c.params;
  return id;
};
// app.get("/users/:id", findOne);
```

En el navegador ingrese http://localhost:8080/users/user123 deberia ver "user123" por pantalla.

## Parametros de consulta

`/list?page=0&size=5`

```ts
const paging: HandlerFunc = (c) => {
  // optiene los parametros de consulta mediante queryParams
  const { page, size } = c.queryParams;
  return `page: ${page}, size: ${size}`;
};
// app.get("/list", paging);
```

En el navegador ingrese http://localhost:8080/list?page=0&size=5 deberia ver "page: 0, size: 5" por pantalla.

## Manejo de archivos estaticos

Envia cualquier diectorio `./folder/sample` desde la ruta `/sample/*`.

```ts
app.static("/sample", "./folder/sample");
```

## Middleware

```ts
const track: MiddlewareFunc = (next) => (c) => {
  console.log(`request to ${c.path}`);
  return next(c);
};

// Root middleware
app.use(logger());

// Group level middleware
const g = app.group("/admin");
g.use(track);

// Route level middleware
app.get(
  "/users",
  (c) => {
    return "/users";
  },
  track
);
```