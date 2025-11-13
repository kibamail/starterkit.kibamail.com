/**
 * Pagination Utilities
 *
 * Standard pagination types and helpers for API endpoints.
 * Provides consistent pagination interface across all endpoints.
 *
 * @example
 * ```ts
 * import { parsePaginationParams, createPaginatedResponse } from "@/lib/api/pagination";
 *
 * export async function GET(request: NextRequest) {
 *   const { page, limit, skip } = parsePaginationParams(request);
 *
 *   const [items, total] = await Promise.all([
 *     prisma.item.findMany({ skip, take: limit }),
 *     prisma.item.count(),
 *   ]);
 *
 *   return responseOk(createPaginatedResponse(items, total, page, limit));
 * }
 * ```
 */

import type { NextRequest } from "next/server";

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Number of items to skip (calculated from page and limit) */
  skip: number;
}

/**
 * Pagination metadata structure
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Paginated response structure (legacy - for backward compatibility)
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from request URL
 *
 * Extracts `page` and `limit` query parameters from the request URL.
 * Provides sensible defaults and enforces maximum limits.
 *
 * @param request - Next.js request object
 * @returns Pagination parameters including calculated skip value
 *
 * @example
 * ```ts
 * // GET /api/items?page=2&limit=50
 * const { page, limit, skip } = parsePaginationParams(request);
 * // Returns: { page: 2, limit: 50, skip: 50 }
 * ```
 */
export function parsePaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams;

  const pageParam = searchParams.get("page");
  const page = Math.max(1, Number.parseInt(pageParam ?? String(DEFAULT_PAGE)));

  const limitParam = searchParams.get("limit");
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(limitParam ?? String(DEFAULT_LIMIT))),
  );

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination metadata
 *
 * Generates pagination metadata for API responses.
 * Calculates total pages and navigation flags automatically.
 *
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Pagination metadata object
 *
 * @example
 * ```ts
 * const items = await prisma.item.findMany({ skip, take: limit });
 * const total = await prisma.item.count();
 * const meta = createPaginationMeta(total, page, limit);
 *
 * return responseOk('item_list', items, meta);
 * ```
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create a paginated response object (legacy)
 *
 * @deprecated Use createPaginationMeta() with responseOk() instead
 *
 * Generates a standardized paginated response with metadata.
 * Calculates total pages and navigation flags automatically.
 *
 * @param data - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Paginated response object
 *
 * @example
 * ```ts
 * const items = await prisma.item.findMany({ skip, take: limit });
 * const total = await prisma.item.count();
 *
 * return responseOk(
 *   createPaginatedResponse(items, total, page, limit)
 * );
 * ```
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, page, limit),
  };
}
