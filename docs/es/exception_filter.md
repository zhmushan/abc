## Exception Filter

Abc viene con una `exceptions layer` o `capa de excepciones` incorporada que maneja todas las excepciones no controladas en la aplicación y luego envía automáticamente una respuesta adecuada y fácil de usar.

### Uso

```ts
const app = new Application();
app.post("/admin", c => {
  throw new HttpException("Forbidden", Status.Forbidden);
});
```


Cuando el cliente llama a este a esta ruta, la respuesta se ve así:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```


También puede especificar el contenido del cuerpo de respuesta.

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

Así es como se vería la respuesta:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

### Custom Exception

Una vez que herede `HttpException`, Abc reconocerá su excepción y se encargará automáticamente de enviar la respuesta de error

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


Abc tiene un conjunto de excepciones heredadas de `HttpException` esta es la lista:

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