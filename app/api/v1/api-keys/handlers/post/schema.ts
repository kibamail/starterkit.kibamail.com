/**
 * POST /api/v1/api-keys - Validation Schema
 *
 * Validates the request body when creating a new API key.
 */

import { z } from "zod";

/**
 * Create API Key Request Body Schema
 *
 * @example
 * {
 *   "name": "Production API Key",
 *   "expiresAt": "2024-12-31T23:59:59Z"
 * }
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  expiresAt: z.iso.datetime().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
