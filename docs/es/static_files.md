## Manejo de archivos estaticos

`static` registra una nueva ruta con el prefijo de ruta para servir archivos estáticos desde el directorio raíz proporcionado. Por ejemplo, una solicitud a `/static/js/main.js` buscará y servirá el archivo desde` assets/js/main.js`.

```ts
app.static("/static", "assets");
```

`abc.file()` registra una nueva ruta para servir un archivo estático.

```ts
app.file("/", "public/index.html");
```
