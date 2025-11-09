/**
 * Workspaces Collection - Handlers
 *
 * Business logic for /api/internal/v1/workspaces endpoints
 */

import type { NextRequest } from "next/server";

import { logto } from "@/auth/logto";
import { InternalServerError } from "@/lib/api/errors";
import { responseCreated } from "@/lib/api/responses";
import { validateRequestBody } from "@/lib/api/validation";
import type { UserSession } from "@/lib/auth/get-session";
import { Cookies, CookieKey } from "@/lib/cookies";
import { createWorkspaceSchema } from "./schema";
import { OWNER_ROLE } from "@/config/rbac";

/**
 * POST /api/internal/v1/workspaces
 *
 * Create a new workspace
 */
export async function createWorkspace(
  session: UserSession,
  request: NextRequest
) {
  const data = await validateRequestBody(createWorkspaceSchema, request);

  const workspace = await logto.workspaces().create({
    name: data.name,
    description: data.description,
  });

  if (!workspace) {
    throw new InternalServerError("Failed to create workspace");
  }

  const ownerRoleId = await logto
    .workspaces()
    .members(workspace.id)
    .getRoleIdByName(OWNER_ROLE);

  if (!ownerRoleId) {
    throw new InternalServerError("Owner role not found");
  }

  const response = await logto
    .workspaces()
    .members(workspace.id)
    .add(session.user.sub, [ownerRoleId]);

  console.dir(response?.error, { depth: null });

  await Cookies.set(CookieKey.ACTIVE_WORKSPACE_ID, workspace.id);

  return responseCreated({
    data: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description ?? null,
    },
  });
}
