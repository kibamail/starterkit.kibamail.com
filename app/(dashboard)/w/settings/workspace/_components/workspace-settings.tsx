"use client";

import * as EmptyCard from "@kibamail/owly/empty-card";
import * as SettingsCard from "@kibamail/owly/settings-card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InviteMembers } from "@/app/(dashboard)/w/_components/workspaces/invite-members";
import type {
  LogtoOrganizationInvitation,
  LogtoOrganizationMember,
} from "@/auth/logto";
import { useToggleState } from "@/hooks/utils/useToggleState";
import { DeleteWorkspaceCard } from "./delete-workspace-card";
import { TeamMembersTable } from "./team-members-table";
import { WorkspaceProfileCard } from "./workspace-profile-card";

interface WorkspaceSettingsProps {
  members: LogtoOrganizationMember[];
  invitations: LogtoOrganizationInvitation[];
  canManageMembers: boolean;
  currentUserId: string;
  workspaceName: string;
}

export function WorkspaceSettings({
  members,
  invitations,
  canManageMembers,
  currentUserId,
  workspaceName,
}: WorkspaceSettingsProps) {
  const router = useRouter();
  const inviteMembersState = useToggleState();
  const changeRoleState = useToggleState();
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    email: string;
    role: string;
  } | null>(null);

  // Override onOpenChange to handle router refresh after invitation
  const handleInviteOpenChange = (
    value: boolean | ((prev: boolean) => boolean),
  ) => {
    const open =
      typeof value === "function" ? value(inviteMembersState.open) : value;
    if (!open && inviteMembersState.open) {
      // Dialog is closing, refresh the page to show new member
      router.refresh();
    }
    inviteMembersState.onOpenChange?.(value);
  };

  const handleChangeRoleOpenChange = (
    value: boolean | ((prev: boolean) => boolean),
  ) => {
    const open =
      typeof value === "function" ? value(changeRoleState.open) : value;
    if (!open && changeRoleState.open) {
      // Dialog is closing, refresh the page
      router.refresh();
    }
    changeRoleState.onOpenChange?.(value);
  };

  const handleChangeRole = (member: {
    id: string;
    email: string;
    role: string;
  }) => {
    setSelectedMember(member);
    changeRoleState.onOpenChange?.(true);
  };

  // Show empty state if user doesn't have permission
  if (!canManageMembers) {
    return (
      <div className="w-full">
        <SettingsCard.Root>
          <SettingsCard.Header>
            <div>
              <h3 className="text-lg font-semibold text-kb-content-primary">
                Team members
              </h3>
              <p className="text-sm text-kb-content-secondary mt-1">
                Manage who has access to this workspace
              </p>
            </div>
          </SettingsCard.Header>

          <SettingsCard.Content>
            <EmptyCard.Root>
              <EmptyCard.Title>No access to team members</EmptyCard.Title>
              <EmptyCard.Description>
                You don't have permission to view or manage team members in this
                workspace.
              </EmptyCard.Description>
            </EmptyCard.Root>
          </SettingsCard.Content>
        </SettingsCard.Root>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Workspace Profile Card */}
      <WorkspaceProfileCard workspaceName={workspaceName} />

      {/* Team Members Card */}
      <TeamMembersTable
        members={members}
        invitations={invitations}
        inviteMembersState={{
          ...inviteMembersState,
          onOpenChange: handleInviteOpenChange,
        }}
        onChangeRole={handleChangeRole}
        currentUserId={currentUserId}
      />

      {/* Delete Workspace Card */}
      <DeleteWorkspaceCard workspaceName={workspaceName} />

      {/* Dialogs */}
      <InviteMembers
        {...inviteMembersState}
        onOpenChange={handleInviteOpenChange}
      />
      <InviteMembers
        {...changeRoleState}
        onOpenChange={handleChangeRoleOpenChange}
        mode="change-role"
        member={selectedMember ?? undefined}
      />
    </div>
  );
}
