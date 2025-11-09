/**
 * API Request Middleware
 *
 * Composable middleware utilities for Next.js API routes.
 * Provides authentication, authorization, and error handling.
 *
 * @example
 * ```ts
 * // Single middleware
 * export async function POST(request: NextRequest) {
 *   return withSession(request, async (session, request) => {
 *     // handler has access to session
 *     return responseOk({ user: session.user })
 *   })
 * }
 *
 * // With permission checks
 * export async function DELETE(request: NextRequest) {
 *   return withSession(
 *     request,
 *     async (session, request) => {
 *       // Only executes if user has permission
 *       return responseOk({})
 *     },
 *     ["delete:workspace"]
 *   )
 * }
 *
 * // Stacked middleware with error handling
 * export async function POST(request: NextRequest) {
 *   return withErrorHandling(request, () =>
 *     withSession(
 *       request,
 *       async (session, request) => {
 *         // Can throw ApiError here, it will be caught and handled
 *         throw new NotFoundError('Resource not found')
 *       },
 *       ["manage:members"]
 *     )
 *   )
 * }
 * ```
 */

import { revalidatePath } from "next/cache";
import type { NextRequest, NextResponse } from "next/server";
import { NextResponse as NextResp } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";
import {
  responseUnauthorized,
  responseValidationFailed,
} from "@/lib/api/responses";
import { getSession, type UserSession } from "@/lib/auth/get-session";
import { requirePermissions } from "@/lib/auth/permissions";
import type { Permission } from "@/config/rbac";

/**
 * Handler that receives session and request
 */
type SessionHandler = (
  session: UserSession,
  request: NextRequest
) => Promise<NextResponse> | NextResponse;

/**
 * Require authenticated session
 *
 * Verifies the user is authenticated and injects the session into the handler.
 * Returns 401 if the user is not authenticated.
 * Optionally checks for required permissions before executing the handler.
 * Automatically revalidates /w/* routes after handler executes successfully.
 *
 * @param request - Next.js request object
 * @param handler - Handler function that receives session and request
 * @param requiredPermissions - Optional array of permissions to check before executing handler
 * @returns Response from handler or 401 Unauthorized
 *
 * @example Basic usage
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withSession(request, async (session, request) => {
 *     return responseOk({
 *       user: session.user,
 *       organization: session.currentOrganization
 *     })
 *   })
 * }
 * ```
 *
 * @example With permission checks
 * ```ts
 * export async function DELETE(request: NextRequest) {
 *   return withSession(
 *     request,
 *     async (session, request) => {
 *       // Only executes if user has delete:workspace permission
 *       await deleteWorkspace(session.currentOrganization.id)
 *       return responseOk({})
 *     },
 *     ["delete:workspace"]
 *   )
 * }
 * ```
 *
 * @example Multiple permissions
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withSession(
 *     request,
 *     async (session, request) => {
 *       // User must have both permissions
 *       return responseOk({ ... })
 *     },
 *     ["manage:billing", "read:workspace"]
 *   )
 * }
 * ```
 *
 * @example Stack with other middleware
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withErrorHandling(request, () =>
 *     withSession(
 *       request,
 *       async (session, req) => {
 *         return responseCreated({ workspace })
 *       },
 *       ["manage:members"]
 *     )
 *   )
 * }
 * ```
 */
export async function withSession(
  request: NextRequest,
  handler: SessionHandler,
  requiredPermissions?: Permission[]
): Promise<NextResponse> {
  const session = await getSession();

  // Check required permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    for (const permission of requiredPermissions) {
      requirePermissions(session, permission);
    }
  }

  const response = await handler(session, request);

  revalidatePath("/w", "layout");

  return response;
}

/**
 * Handler function type
 */
type Handler = (request: NextRequest) => Promise<NextResponse> | NextResponse;

/**
 * Global error handling middleware
 *
 * Catches all errors thrown in handlers and converts them to appropriate responses.
 * Handles ApiError, ZodError, and unexpected errors.
 *
 * @param request - Next.js request object
 * @param handler - Handler function to execute
 * @returns Response from handler or error response
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withErrorHandling(request, async (req) => {
 *     // Can throw any error
 *     throw new NotFoundError('User not found')
 *     throw new ValidationError('Invalid input', { email: ['Required'] })
 *     throw new Error('Something went wrong')
 *
 *     // All will be caught and converted to proper responses
 *   })
 * }
 * ```
 *
 * @example Stack with other middleware
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withErrorHandling(request, (req) =>
 *     withSession(req, async (session, req) => {
 *       // Errors thrown here are caught by withErrorHandling
 *       if (!session.currentOrganization) {
 *         throw new BadRequestError('No organization found')
 *       }
 *       return responseOk({ org: session.currentOrganization })
 *     })
 *   )
 * }
 * ```
 */
export async function withErrorHandling(
  request: NextRequest,
  handler: Handler
): Promise<NextResponse> {
  try {
    return await handler(request);
  } catch (error) {
    // Handle custom API errors
    if (error instanceof ApiError) {
      return NextResp.json(
        {
          error: error.message,
          ...(error.fieldErrors && { fieldErrors: error.fieldErrors }),
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return responseValidationFailed(error);
    }

    console.error(error);

    return NextResp.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
