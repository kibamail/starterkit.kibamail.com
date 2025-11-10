/**
 * Workspace Settings Page
 *
 * Manage workspace members and permissions.
 * Displays team members and allows inviting new members.
 */

import { getSession } from "@/lib/auth/get-session";
import { logto } from "@/auth/logto";
import { WorkspaceSettings } from "./_components/workspace-settings";

export default async function WorkspaceSettingsPage() {
  const session = await getSession();
  const workspaceId = session.currentOrganization?.id as string;

  // Fetch workspace members and pending invitations from Logto
  const [members, invitations] = await Promise.all([
    logto.workspaces().members(workspaceId).list(),
    logto.workspaces().members(workspaceId).listInvitations(),
  ]);

  return (
    <WorkspaceSettings
      members={members ?? []}
      invitations={invitations ?? []}
    />
  );
}
