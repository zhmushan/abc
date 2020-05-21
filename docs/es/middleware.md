## Middleware

Los Middleware son funciones que se llaman alrededor del manejador de rutas, las funciones middleware tienen acceso a los objetos `request` y` response`.

Comencemos implementando un middleware simple.

```ts
const track: MiddlewareFunc = next => c => {
  console.log(`request to ${c.path}`);
  return next(c);
};
```

## Levels

- A Nivel raíz: Los middleware de `nivel raíz` se ejecuta antes de que el enrutador procese la solicitud. Se puede registrar a través de `pre`

- A Nivel de grupo: al crear un nuevo grupo, puedes registrar el middleware solo para ese grupo.

- A Nivel de ruta: al definir una nueva ruta, opcionalmente puedes registrar el middleware solo para la ruta.

## Skipper

Hay casos en los que desea omitir un middleware en función de algunas condiciones, para eso cada middleware tiene una opción para definir una función `skipper (c: Context): boolean` esta devuelve un valor true o false.

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
