/**
 * Workspace Members Endpoint - Validation Schemas
 *
 * Schemas for POST /api/internal/v1/workspaces/[id]/members
 */

import { z } from "zod";

/**
 * POST /api/internal/v1/workspaces/[id]/members - Invite Members
 *
 * Request Body Schema
 */
export const inviteMembersSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.string().min(1, "Role is required"),
      }),
    )
    .min(1, "At least one invite is required")
    .max(50, "Cannot invite more than 50 members at once"),
});

/**
 * POST /api/internal/v1/workspaces/[id]/members - Invite Members
 *
 * Response Schema
 */
export const inviteMembersResponseSchema = z.object({
  data: z.object({
    invitedCount: z.number(),
    failedCount: z.number(),
    invitations: z.array(
      z.object({
        email: z.string(),
        status: z.enum(["success", "failed", "already_member"]),
        error: z.string().optional(),
      }),
    ),
  }),
});

// Type exports
export type InviteMembersInput = z.infer<typeof inviteMembersSchema>;
export type InviteMembersResponse = z.infer<typeof inviteMembersResponseSchema>;
