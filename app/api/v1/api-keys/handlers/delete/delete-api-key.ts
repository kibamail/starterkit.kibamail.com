/**
 * DELETE /api/v1/api-keys/:id
 *
 * Deletes an API key. This action is permanent and cannot be undone.
 *
 * @example Response
 * {
 *   "message": "API key deleted successfully"
 * }
 */

import { NextRequest, NextResponse } from "next/server";

export async function DELETE_API_KEY(
  request: NextRequest,
  params: { id: string },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    // TODO: Get user from auth context
    // TODO: Verify ownership
    // TODO: Delete from database
    // await db.apiKey.delete({ where: { id: params.id, userId } })

    return NextResponse.json(
      { message: "API key deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 },
    );
  }
}
