/**
 * Workspace Members Endpoint - Business Logic
 *
 * Handlers for POST /api/internal/v1/workspaces/[id]/members
 */

import type { NextRequest } from "next/server";
import { logto } from "@/auth/logto";
import type { UserSession } from "@/lib/auth/get-session";
import { responseOk } from "@/lib/api/responses";
import { validateRequestBody } from "@/lib/api/validation";
import { inviteMembersSchema } from "./schema";

/**
 * POST /api/internal/v1/workspaces/[id]/members
 *
 * Invite members to a workspace
 *
 * Creates organization invitations via Logto Management API.
 * Does NOT send emails - Logto handles email delivery based on connector config.
 */
export async function inviteMembers(
  session: UserSession,
  request: NextRequest,
  params: { id: string }
) {
  const data = await validateRequestBody(inviteMembersSchema, request);
  const workspaceId = params.id;
  const inviterId = session.user.sub;

  // Process all invitations in parallel
  const results = await Promise.allSettled(
    data.invites.map(async (invite) => {
      try {
        // Get role ID from role name
        const roleId = await logto
          .workspaces()
          .members(workspaceId)
          .getRoleIdByName(invite.role);

        if (!roleId) {
          throw new Error(`Invalid role: ${invite.role}`);
        }

        // Create invitation in Logto (Logto handles email sending)
        const inv = await logto
          .workspaces()
          .members(workspaceId)
          .invite(inviterId, invite.email, [roleId]);

        console.dir({ inv });

        return {
          email: invite.email,
          status: "success" as const,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const isAlreadyMember =
          errorMessage.toLowerCase().includes("already") ||
          errorMessage.toLowerCase().includes("exists");

        if (isAlreadyMember) {
          return {
            email: invite.email,
            status: "already_member" as const,
            error: errorMessage,
          };
        }

        return {
          email: invite.email,
          status: "failed" as const,
          error: errorMessage,
        };
      }
    })
  );

  // Collect results
  const invitations = results.map((result) =>
    result.status === "fulfilled" ? result.value : result.reason
  );

  const invitedCount = invitations.filter(
    (inv) => inv.status === "success"
  ).length;
  const failedCount = invitations.filter(
    (inv) => inv.status === "failed"
  ).length;

  return responseOk({
    data: {
      invitedCount,
      failedCount,
      invitations,
    },
  });
}
