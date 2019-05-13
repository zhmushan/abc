## Bind Data

**Note**: First please ensure that `experimentalDecorators` and `emitDecoratorMetadata` are enabled.

To bind request body into a Object use `context.bind()`. The default bind function supports decoding `application/json`, `application/x-www-form-urlencoded` and `multipart/form-data` data based on the Content-Type header.

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
