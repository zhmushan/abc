# Abc 风格指南

## 名称

- 使用 PascalCase 作为类型名称。
- 使用 PascalCase 作为枚举值。
- 将 PascalCase 用于全局常量。
- 使用 camelCase 作为函数名称。
- 将 camelCase 用于属性名称和局部变量。

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

## `null` 和 `undefined`

- 总是使用 `undefined`。
