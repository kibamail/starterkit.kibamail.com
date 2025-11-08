/**
 * GET /api/v1/api-keys
 *
 * Retrieves all API keys for the authenticated user.
 *
 * @example Response
 * {
 *   "data": [
 *     {
 *       "id": "key_123",
 *       "name": "Production Key",
 *       "userId": "user_123",
 *       "createdAt": "2024-01-01T00:00:00Z",
 *       "expiresAt": null,
 *       "lastUsedAt": "2024-01-15T10:30:00Z"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiKeyResponse } from "../../types";

export async function LIST_API_KEYS(
  request: NextRequest,
): Promise<NextResponse<{ data: ApiKeyResponse[] }>> {
  // TODO: Get user from auth context
  // TODO: Fetch API keys from database
  // const apiKeys = await db.apiKey.findMany({ where: { userId } })

  // Mock response for now
  const data: ApiKeyResponse[] = [
    {
      id: "key_123",
      name: "Production Key",
      userId: "user_123",
      createdAt: new Date().toISOString(),
      expiresAt: null,
      lastUsedAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({ data }, { status: 200 });
}
