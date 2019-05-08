## 中间件

中间件是一个围绕路由处理程序调用的函数. 中间件函数可以访问 `request` 和 `response` 对象.

让我们从实现一个简单的中间件功能开始.

```ts
function track(next: HandlerFunc) {
  return function(c: Context) {
    console.log(`request to ${c.path}`);
    next(c);
  };
}
```

## 级别

- 根级: 在路由处理请求之前执行根级中间件. 它可以通过 `abc().pre()` 注册.

- 组级: 创建新组时, 你可以仅为该组注册中间件.

- 路由级: 定义新路由时, 你可以选择仅为其注册中间件.

## 跳过中间件

有些情况下, 你希望基于某些条件跳过中间件, 对此每个中间件都有一个选项来定义函数 `skipper（c：Context）：boolean`.

```ts
abc().use(
  logger({
    skipper: c => {
      return c.path.startsWith("/skipper");
    }
  })
);
```
