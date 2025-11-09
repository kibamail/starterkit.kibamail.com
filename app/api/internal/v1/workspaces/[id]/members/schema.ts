/**
 * Workspace Members Endpoint - Validation Schemas
 *
 * Schemas for POST /api/internal/v1/workspaces/[id]/members
 */

import { z } from "zod";
import { ROLE_NAMES } from "@/config/rbac";

/**
 * POST /api/internal/v1/workspaces/[id]/members - Invite Member
 *
 * Request Body Schema
 */
export const inviteMembersSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  role: z.enum(ROLE_NAMES as [string, ...string[]], {
    message: `Role must be one of: ${ROLE_NAMES.join(", ")}`,
  }),
});

/**
 * POST /api/internal/v1/workspaces/[id]/members - Invite Member
 *
 * Response Schema
 */
export const inviteMembersResponseSchema = z.object({
  data: z.object({
    email: z.string(),
    invitationId: z.string(),
  }),
});

// Type exports
export type InviteMembersInput = z.infer<typeof inviteMembersSchema>;
export type InviteMembersResponse = z.infer<typeof inviteMembersResponseSchema>;
