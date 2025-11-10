/**
 * API Key by ID Endpoint
 *
 * RESTful API endpoint for managing a specific API key.
 *
 * Base URL: /api/v1/api-keys/:id
 *
 * Supported Methods:
 * - DELETE /api/v1/api-keys/:id      Delete an API key
 *
 * Authentication: Required (Bearer token or session)
 *
 * @see ../handlers/delete - Handler implementation
 */

import type { NextRequest } from "next/server";
import { DELETE_API_KEY } from "../handlers/delete/delete-api-key";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return DELETE_API_KEY(request, { id });
}
