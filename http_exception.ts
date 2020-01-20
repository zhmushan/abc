import { Status } from "./deps.ts";

export interface HttpExceptionBody {
  message?: string;
  error?: string;
  statusCode?: number;
}

export function createHttpExceptionBody(
  message: string,
  error?: string,
  statusCode?: number
): HttpExceptionBody;
export function createHttpExceptionBody<T extends Record<string, any>>(
  body: T
): T;
export function createHttpExceptionBody<T extends Record<string, any>>(
  msgOrBody: string | T,
  error?: string,
  statusCode?: number
): HttpExceptionBody | T {
  if (typeof msgOrBody === "object" && !Array.isArray(msgOrBody)) {
    return msgOrBody;
  } else if (typeof msgOrBody === "string") {
    return { statusCode, error, message: msgOrBody };
  }
  return { statusCode, error };
}

export class HttpException extends Error {
  readonly message: any;
  constructor(
    readonly response: string | Record<string, any>,
    readonly status: number
  ) {
    super();
    this.message = response;
  }
}

export class BadGatewayException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Bad Gateway"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.BadGateway),
      Status.BadGateway
    );
  }
}

export class BadRequestException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Bad Request"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.BadRequest),
      Status.BadRequest
    );
  }
}

export class ConflictException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Conflict"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.Conflict),
      Status.Conflict
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Forbidden"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.Forbidden),
      Status.Forbidden
    );
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Gateway Timeout"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.GatewayTimeout),
      Status.GatewayTimeout
    );
  }
}

export class GoneException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Gone"
  ) {
    super(createHttpExceptionBody(message, error, Status.Gone), Status.Gone);
  }
}

export class TeapotException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Teapot"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.Teapot),
      Status.Teapot
    );
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Method Not Allowed"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.MethodNotAllowed),
      Status.MethodNotAllowed
    );
  }
}

export class NotAcceptableException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Not Acceptable"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.NotAcceptable),
      Status.NotAcceptable
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Not Found"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.NotFound),
      Status.NotFound
    );
  }
}

export class NotImplementedException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Not Implemented"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.NotImplemented),
      Status.NotImplemented
    );
  }
}

export class RequestEntityTooLargeException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Request Entity Too Large"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.RequestEntityTooLarge),
      Status.RequestEntityTooLarge
    );
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Request Timeout"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.RequestTimeout),
      Status.RequestTimeout
    );
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Service Unavailable"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.ServiceUnavailable),
      Status.ServiceUnavailable
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Unauthorized"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.Unauthorized),
      Status.Unauthorized
    );
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Unprocessable Entity"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.UnprocessableEntity),
      Status.UnprocessableEntity
    );
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Internal Server Error"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.InternalServerError),
      Status.InternalServerError
    );
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(
    message?: string | Record<string, any> | any,
    error: string = "Unsupported Media Type"
  ) {
    super(
      createHttpExceptionBody(message, error, Status.UnsupportedMediaType),
      Status.UnsupportedMediaType
    );
  }
}
