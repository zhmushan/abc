## 异常过滤

Abc 会处理应用程序中所有未处理的异常, 然后自动发送适当的用户友好响应.

### 用法

```ts
abc().post("/admin", c => {
  throw new HttpException("Forbidden", Status.Forbidden);
});
```

当客户端调用此端点时, 响应如下所示:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

你还可以自定义响应的内容.

```ts
abc().post("/admin", c => {
  throw new HttpException(
    {
      status: Status.Forbidden,
      error: "This is a custom message"
    },
    Status.Forbidden
  );
});
```

使用上面的内容, 这就是响应的样子:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

### 自定义异常

一旦继承了 `HttpException`, Abc 将识别你的异常并自动处理错误响应。

```ts
export class ForbiddenException extends HttpException {
  constructor() {
    super("Forbidden", Status.Forbidden);
  }
}

abc().post("/admin", c => {
  throw new ForbiddenException();
});
```

响应:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

## Http 异常

Abc 有一组从 `HttpException` 继承的异常:

- BadGatewayException
- BadRequestException
- ConflictException
- ForbiddenException
- GatewayTimeoutException
- GoneException
- TeapotException
- MethodNotAllowedException
- NotAcceptableException
- NotFoundException
- NotImplementedException
- RequestEntityTooLargeException
- RequestTimeoutException
- ServiceUnavailableException
- UnauthorizedException
- UnprocessableEntityException
- InternalServerErrorException
- UnsupportedMediaTypeException
