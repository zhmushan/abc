# Abc Style Guide

## Names

- Use PascalCase for type names.
- Use PascalCase for enum values.
- Use PascalCase for global constants.
- Use camelCase for function names.
- Use camelCase for property names and local variables.

```ts
// Bad
export type myType = string;

// Good
export type MyType = string;
```

```ts
// Bad
enum Color {
  RED,
  BLACK
}

// Good
enum Color {
  Red,
  Black
}
```

```ts
// Bad
export function notFoundHandler(_?: Context): never {
  throw new Error();
}

// Good
export function NotFoundHandler(_?: Context): never {
  throw new Error();
}
```

```ts
// Bad
export function NotFoundHandler(flag: boolean): void | never {
  if (flag) {
    throw new Error();
  }
}

// Good
export function notFoundHandler(flag: boolean): void | never {
  if (flag) {
    throw new Error();
  }
}
```

```ts
// Bad
const GLOBAL_CONFIG = {};

// Good
const GlobalConfig = {};
```

## `null` & `undefined`

- Always use `undefined`.
