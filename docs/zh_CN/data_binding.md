## 数据绑定

**注意**: 首先请确保 `experimentalDecorators` 和 `emitDecoratorMetadata` 已经被启用.

要将请求主体绑定到对象, 请使用 `context.bind()`. 默认的绑定函数支持基于请求头中的 Content-Type 解码 `application/json`，`application/x-www-form-urlencoded` 和 `multipart/form-data` 数据.

```ts
@Binder()
class UserDTO {
  constructor(
    public username: string,
    public password: string,
    public age: number
  ) {}
}

abc()
  .post("/user", async (c: Context) => {
    const user = await c.bind(UserDTO);
    return user;
  })
  .start("0.0.0.0:8080");
```
