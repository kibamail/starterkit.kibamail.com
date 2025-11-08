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

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 *
 * @example
 * ```ts
 * throw new BadRequestError('Missing required field')
 * ```
 */
export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized
 *
 * @example
 * ```ts
 * throw new UnauthorizedError('Invalid API key')
 * ```
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden
 *
 * @example
 * ```ts
 * throw new ForbiddenError('You do not have permission to access this resource')
 * ```
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 *
 * @example
 * ```ts
 * throw new NotFoundError('Workspace not found')
 * ```
 */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict
 *
 * @example
 * ```ts
 * throw new ConflictError('Email already exists')
 * ```
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
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
 * ```
 */
export class ValidationError extends ApiError {
  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super(message, 422, fieldErrors);
  }
}

/**
 * 429 Rate Limit Exceeded
 *
 * @example
 * ```ts
 * throw new RateLimitError('Too many requests. Try again in 60 seconds')
 * ```
 */
export class RateLimitError extends ApiError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 *
 * @example
 * ```ts
 * throw new InternalServerError('Database connection failed')
 * ```
 */
export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable
 *
 * @example
 * ```ts
 * throw new ServiceUnavailableError('Maintenance in progress')
 * ```
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503);
  }
}
