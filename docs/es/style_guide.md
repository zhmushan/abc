# Abc Guia de estilos

## Para los numbres

- Usa PascalCase para alias de tipo.
- Usa PascalCase para enum.
- Usa PascalCase para constantes globales.
- Usa camelCase para nombres de funciones.
- Usa camelCase para nombres de propiedades y variable locales.

```ts
// Incorrecto
export type myType = string;

// Correcto
export type MyType = string;
```

```ts
// Incorrecto
enum Color {
  RED,
  BLACK,
}

// Correcto
enum Color {
  Red,
  Black,
}
```

```ts
// Incorrecto
export function notFoundHandler(_?: Context): never {
  throw new Error();
}

// Correcto
export function NotFoundHandler(_?: Context): never {
  throw new Error();
}
```

```ts
// Incorrecto
export function NotFoundHandler(flag: boolean): void | never {
  if (flag) {
    throw new Error();
  }
}

// Correcto
export function notFoundHandler(flag: boolean): void | never {
  if (flag) {
    throw new Error();
  }
}
```

```ts
// Incorrecto
const GLOBAL_CONFIG = {};

// Correcto
const GlobalConfig = {};
```

## `null` y `undefined`

- Simepre usa `undefined`.
