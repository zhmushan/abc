## Exception Filter

Abc comes with a built-in `exceptions layer` that handles all unhandled exceptions in the application and then automatically sends an appropriate user-friendly response.

### Usage

```ts
const app = new Application();
app.post("/admin", c => {
  throw new HttpException("Forbidden", Status.Forbidden);
});
```

When the client calls this endpoint, the response looks like this:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

You can also customize the content of the response body.

```ts
const app = new Application();
app.post("/admin", c => {
  throw new HttpException(
    {
      status: Status.Forbidden,
      error: "This is a custom message"
    },
    Status.Forbidden
  );
});
```

Using the above, this is how the response would look:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

### Custom Exception

Once you inherit `HttpException`, Abc will recognize your exception and automatically take care of the error response.

```ts
export class ForbiddenException extends HttpException {
  constructor() {
    super("Forbidden", Status.Forbidden);
  }
}

const app = new Application();
app.post("/admin", c => {
  throw new ForbiddenException();
});
```

Response:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

## Http Exceptions

Abc has a set of exceptions inherited from `HttpException`:

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
