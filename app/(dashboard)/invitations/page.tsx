/**
 * Organization Invitations Page
 *
 * Displays a list of pending organization invitations for the current user.
 * Users can view and accept invitations to join workspaces.
 */

import { logto } from "@/auth/logto";
import { getSession } from "@/lib/auth/get-session";

export default async function InvitationsPage() {
  await getSession();

  const invitations = await logto.users().getInvitations();

  console.log({ invitations });

  return <div className="">{invitations?.length || 0}</div>;
}
