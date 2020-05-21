## Router


El enrutador esta basado en[radix tree](https://en.wikipedia.org/wiki/Radix_tree), esto hace que la busqueda de rutas sea muy rapida.

## Parametros de rutas

```
Pattern: /user/:name

/user/my              match
/user/you             match
/user/my/profile      no match
/user/                no match
```

**Nota**: No puede registrar los patrones `/ user / new` y` / user /: name` para el mismo método de solicitud al mismo tiempo. El enrutamiento de diferentes métodos de solicitud es independiente el uno del otro.

## Capturando todos los parametros

```
Pattern: /src/*filepath

/src/                   match
/src/somefile           match
/src/subdir/somefile    match
```