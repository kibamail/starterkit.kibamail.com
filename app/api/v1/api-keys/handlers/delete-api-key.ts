/**
 * Delete API Key Handler
 *
 * DELETE /api/v1/api-keys/[keyId]
 */

import type { ApiKey } from "@prisma/client";
import { BadRequestError } from "@/lib/api/errors";
import { prisma } from "@/lib/db";
import { responseOk } from "@/lib/api/responses";

/**
 * Delete an API key from the workspace
 *
 * Workspace is determined from the authenticated API key.
 * Prevents deleting the currently-used API key.
 *
 * @param apiKey - Authenticated API key from withApiSession
 * @param params - Route params containing keyId
 * @returns Response confirming deletion
 */
export async function deleteApiKeyHandler(
  apiKey: ApiKey,
  params: { keyId: string }
) {
  const keyId = params.keyId;
  const workspaceId = apiKey.workspaceId;

  const keyToDelete = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });

  if (!keyToDelete || keyToDelete.workspaceId !== workspaceId) {
    throw new BadRequestError("Could not find api key.");
  }

  if (keyToDelete.id === apiKey.id) {
    throw new BadRequestError(
      "Cannot delete the API key currently being used for authentication"
    );
  }

  // Delete the key
  await prisma.apiKey.delete({
    where: { id: keyId },
  });

  return responseOk(undefined, "api_key");
}
