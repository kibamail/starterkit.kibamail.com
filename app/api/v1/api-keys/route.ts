/**
 * API Keys Endpoint
 *
 * RESTful API endpoint for managing API keys.
 *
 * Base URL: /api/v1/api-keys
 *
 * Supported Methods:
 * - GET    /api/v1/api-keys          List all API keys
 * - POST   /api/v1/api-keys          Create a new API key
 * - DELETE /api/v1/api-keys/:id      Delete an API key
 *
 * Authentication: Required (Bearer token or session)
 *
 * @see ./handlers/ - Handler implementations
 */

import type { NextRequest } from "next/server";
import { LIST_API_KEYS } from "./handlers/list/list-api-keys";
import { CREATE_API_KEY } from "./handlers/post/create-api-key";
import { DELETE_API_KEY } from "./handlers/delete/delete-api-key";

export async function GET(request: NextRequest) {
  return LIST_API_KEYS(request);
}

export async function POST(request: NextRequest) {
  return CREATE_API_KEY(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return DELETE_API_KEY(request, params);
}
