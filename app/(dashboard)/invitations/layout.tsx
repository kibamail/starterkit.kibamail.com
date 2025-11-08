/**
 * Invitations Layout
 *
 * Simple layout for invitation-related pages.
 * Renders children without the workspace dashboard chrome.
 */

import type { PropsWithChildren } from "react";

export default async function InvitationsLayout({
  children,
}: PropsWithChildren) {
  return <>{children}</>;
}
