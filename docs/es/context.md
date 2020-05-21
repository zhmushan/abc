## Usando Contexto

### crea contextos personalizados heredando de la clase *Context*

```ts
// Declara un nuevo *CustomContext*
class CustomContext extends Context {
  constructor(c: Context) {
    super(c);
  }

  hello() {
    this.string("Hola Mundo");
  }
}

// Reemplaza el contexto original
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

En el navegador en http://localhost:8080 deberia ver "Hola Mundo" en la pagina.
