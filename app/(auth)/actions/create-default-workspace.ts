/**
 * Create Default Workspace Server Action
 *
 * Checks if the authenticated user has any organizations, and if not,
 * creates a default workspace for them. The workspace is named after
 * the user's email and the user is automatically added as a member.
 *
 * @returns The created organization/workspace object, or undefined if user already has organizations
 *
 * @example
 * await createDefaultWorkspaceAction();
 */

"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logto } from "@/auth/logto";
import { logtoConfig } from "@/config/logto";
import { redirect } from "next/navigation";

export async function createDefaultWorkspaceAction() {
  const ctx = await getLogtoContext(logtoConfig, {
    fetchUserInfo: true,
  });

  if (!ctx.isAuthenticated) {
    return redirect("/");
  }

  if (!ctx.userInfo?.organizations || ctx.userInfo.organizations.length === 0) {
    if (!ctx.userInfo?.sub || !ctx.userInfo?.email) {
      throw new Error("User information is required to create a workspace");
    }

    const org = await logto.workspaces().create({
      name: ctx.userInfo.email,
    });

    await logto
      .workspaces()
      .members(org?.id as string)
      .add(ctx.userInfo.sub, []);

    return org;
  }

  return undefined;
}
