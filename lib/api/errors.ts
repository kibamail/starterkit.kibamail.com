/**
 * API Error Classes
 *
 * Custom error classes for API routes that include HTTP status codes.
 * These errors are automatically handled by the withErrorHandling middleware.
 *
 * @example
 * ```ts
 * // Throw errors in handlers
 * throw new BadRequestError('Invalid email format')
 * throw new NotFoundError('User not found')
 * throw new UnauthorizedError('Invalid credentials')
 * throw new ValidationError({ email: ['Email is required'] })
 * ```
 */

/**
 * Base API Error
 *
 * All API errors extend this class and include an HTTP status code.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string[]>;
  public readonly cause?: Error;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string[]>,
    cause?: Error,
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 *
 * @example
 * ```ts
 * throw new BadRequestError('Missing required field')
 * throw new BadRequestError('Missing required field', originalError)
 * ```
 */
export class BadRequestError extends ApiError {
  constructor(message: string, cause?: Error) {
    super(message, 400, undefined, cause);
  }
}

/**
 * 401 Unauthorized
 *
 * @example
 * ```ts
 * throw new UnauthorizedError('Invalid API key')
 * throw new UnauthorizedError('Invalid API key', originalError)
 * ```
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required", cause?: Error) {
    super(message, 401, undefined, cause);
  }
}

/**
 * 403 Forbidden
 *
 * @example
 * ```ts
 * throw new ForbiddenError('You do not have permission to access this resource')
 * throw new ForbiddenError('You do not have permission to access this resource', originalError)
 * ```
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Access denied", cause?: Error) {
    super(message, 403, undefined, cause);
  }
}

/**
 * 404 Not Found
 *
 * @example
 * ```ts
 * throw new NotFoundError('Workspace not found')
 * throw new NotFoundError('Workspace not found', originalError)
 * ```
 */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", cause?: Error) {
    super(message, 404, undefined, cause);
  }
}

/**
 * 409 Conflict
 *
 * @example
 * ```ts
 * throw new ConflictError('Email already exists')
 * throw new ConflictError('Email already exists', originalError)
 * ```
 */
export class ConflictError extends ApiError {
  constructor(message: string, cause?: Error) {
    super(message, 409, undefined, cause);
  }
}

/**
 * 422 Validation Error
 *
 * Includes field-level validation errors.
 *
 * @example
 * ```ts
 * throw new ValidationError('Validation failed', {
 *   email: ['Invalid email format'],
 *   name: ['Name is required', 'Name must be at least 3 characters']
 * })
 * throw new ValidationError('Validation failed', fieldErrors, originalError)
 * ```
 */
export class ValidationError extends ApiError {
  constructor(message: string, fieldErrors: Record<string, string[]>, cause?: Error) {
    super(message, 422, fieldErrors, cause);
  }
}

/**
 * 429 Rate Limit Exceeded
 *
 * @example
 * ```ts
 * throw new RateLimitError('Too many requests. Try again in 60 seconds')
 * throw new RateLimitError('Too many requests. Try again in 60 seconds', originalError)
 * ```
 */
export class RateLimitError extends ApiError {
  constructor(message = "Rate limit exceeded", cause?: Error) {
    super(message, 429, undefined, cause);
  }
}

/**
 * 500 Internal Server Error
 *
 * @example
 * ```ts
 * throw new InternalServerError('Database connection failed')
 * throw new InternalServerError('Database connection failed', originalError)
 * ```
 */
export class InternalServerError extends ApiError {
  constructor(message = "Internal server error", cause?: Error) {
    super(message, 500, undefined, cause);
  }
}

/**
 * 503 Service Unavailable
 *
 * @example
 * ```ts
 * throw new ServiceUnavailableError('Maintenance in progress')
 * throw new ServiceUnavailableError('Maintenance in progress', originalError)
 * ```
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable", cause?: Error) {
    super(message, 503, undefined, cause);
  }
}
