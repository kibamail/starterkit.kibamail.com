/**
 * POST /api/v1/api-keys
 *
 * Creates a new API key for the authenticated user.
 *
 * @example Request Body
 * {
 *   "name": "Production API Key",
 *   "expiresAt": "2024-12-31T23:59:59Z"
 * }
 *
 * @example Response
 * {
 *   "data": {
 *     "id": "key_123",
 *     "name": "Production API Key",
 *     "key": "sk_live_abc123...",
 *     "userId": "user_123",
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "expiresAt": "2024-12-31T23:59:59Z",
 *     "lastUsedAt": null
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import type { CreateApiKeyResponse } from "../../types";
import { createApiKeySchema } from "./schema";

export async function CREATE_API_KEY(
  request: NextRequest,
): Promise<NextResponse<{ data: CreateApiKeyResponse } | { error: string }>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = createApiKeySchema.parse(body);

    // TODO: Get user from auth context
    // TODO: Generate secure API key
    // TODO: Store in database
    // const apiKey = await db.apiKey.create({ data: { ...validated, userId, key } })

    // Mock response for now
    const data: CreateApiKeyResponse = {
      id: "key_123",
      name: validated.name,
      key: "sk_live_abc123def456ghi789", // Only shown once!
      userId: "user_123",
      createdAt: new Date().toISOString(),
      expiresAt: validated.expiresAt || null,
      lastUsedAt: null,
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    // Validation error
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}
