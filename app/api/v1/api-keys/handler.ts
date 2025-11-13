/**
 * API Keys Endpoints - Business Logic (External API)
 *
 * Handlers for managing workspace API keys via external API
 * Uses API key authentication (withApiSession)
 * Workspace is deduced from the API key, not from URL parameters
 */

import type { NextRequest } from "next/server";
import type { ApiKey } from "@prisma/client";
import { validateRequestBody } from "@/lib/api/validation";
import { prisma } from "@/lib/db";
import { responseCreated, responseOk } from "@/lib/api/responses";
import { createApiKeySchema } from "./schema";
import {
  createPaginatedResponse,
  parsePaginationParams,
} from "@/lib/api/pagination";
import { BadRequestError } from "@/lib/api/errors";

/**
 * Generate a random API key
 *
 * Format: sk_<32 random hex characters>
 * Example: sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *
 * @returns Randomly generated API key
 */
function generateApiKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const hexString = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sk_${hexString}`;
}

/**
 * Hash API key using SHA-256
 *
 * @param key - Plain text API key
 * @returns SHA-256 hash of the key
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create key preview from full API key
 *
 * Shows first 12 characters: sk_abc12345...
 *
 * @param key - Full API key
 * @returns Preview string
 */
function createKeyPreview(key: string): string {
  return key.slice(0, 12) + "...";
}

/**
 * POST /api/v1/api-keys
 *
 * Create a new API key for the workspace
 * Workspace is determined from the authenticated API key
 *
 * Returns the full API key ONLY on creation (never shown again)
 */
export async function createApiKey(apiKey: ApiKey, request: NextRequest) {
  const data = await validateRequestBody(createApiKeySchema, request);

  // Use workspace ID from the authenticated API key
  const workspaceId = apiKey.workspaceId;

  // Generate new API key
  const newApiKey = generateApiKey();
  const keyHash = await hashApiKey(newApiKey);
  const keyPreview = createKeyPreview(newApiKey);

  // Store in database
  const createdKey = await prisma.apiKey.create({
    data: {
      workspaceId,
      name: data.name,
      keyHash,
      keyPreview,
      scopes: data.scopes,
    },
  });

  // Return full key (only time it's ever shown)
  return responseCreated({
    id: createdKey.id,
    name: createdKey.name,
    key: newApiKey, // Full key - ONLY shown on creation
    keyPreview: createdKey.keyPreview,
    scopes: createdKey.scopes,
    createdAt: createdKey.createdAt,
  });
}

/**
 * GET /api/v1/api-keys
 *
 * Get all API keys for the workspace (paginated)
 * Workspace is determined from the authenticated API key
 *
 * Keys are returned WITHOUT the actual key value (only preview)
 */
export async function getApiKeys(apiKey: ApiKey, request: NextRequest) {
  // Use workspace ID from the authenticated API key
  const workspaceId = apiKey.workspaceId;

  // Parse pagination parameters
  const { page, limit, skip } = parsePaginationParams(request);

  // Query API keys with pagination
  const [keys, total] = await Promise.all([
    prisma.apiKey.findMany({
      where: { workspaceId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.apiKey.count({
      where: { workspaceId },
    }),
  ]);

  return responseOk(createPaginatedResponse(keys, total, page, limit));
}

/**
 * DELETE /api/v1/api-keys/[keyId]
 *
 * Delete an API key
 * Workspace is determined from the authenticated API key
 */
export async function deleteApiKey(apiKey: ApiKey, params: { keyId: string }) {
  const keyId = params.keyId;
  const workspaceId = apiKey.workspaceId;

  // Verify the key to delete belongs to this workspace
  const keyToDelete = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });

  if (!keyToDelete || keyToDelete.workspaceId !== workspaceId) {
    throw new BadRequestError("Could not find api key.");
  }

  // Prevent deleting the currently used API key
  if (keyToDelete.id === apiKey.id) {
    throw new BadRequestError(
      "Cannot delete the API key currently being used for authentication"
    );
  }

  // Delete the key
  await prisma.apiKey.delete({
    where: { id: keyId },
  });

  return responseOk({
    success: true,
    message: "API key deleted successfully",
  });
}
