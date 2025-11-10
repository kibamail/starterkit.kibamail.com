"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToggleState } from "@/hooks/utils/useToggleState";
import type {
  LogtoOrganizationInvitation,
  LogtoOrganizationMember,
} from "@/auth/logto";
import { InviteMembers } from "@/app/(dashboard)/w/_components/workspaces/invite-members";
import { TeamMembersTable } from "./team-members-table";

interface WorkspaceSettingsProps {
  members: LogtoOrganizationMember[];
  invitations: LogtoOrganizationInvitation[];
}

export function WorkspaceSettings({
  members,
  invitations,
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
  const handleInviteOpenChange = (value: boolean | ((prev: boolean) => boolean)) => {
    const open = typeof value === "function" ? value(inviteMembersState.open) : value;
    if (!open && inviteMembersState.open) {
      // Dialog is closing, refresh the page to show new member
      router.refresh();
    }
    inviteMembersState.onOpenChange?.(value);
  };

  const handleChangeRoleOpenChange = (value: boolean | ((prev: boolean) => boolean)) => {
    const open = typeof value === "function" ? value(changeRoleState.open) : value;
    if (!open && changeRoleState.open) {
      // Dialog is closing, refresh the page
      router.refresh();
    }
    changeRoleState.onOpenChange?.(value);
  };

  const handleChangeRole = (member: { id: string; email: string; role: string }) => {
    setSelectedMember(member);
    changeRoleState.onOpenChange?.(true);
  };

  return (
    <div className="w-full">
      <TeamMembersTable
        members={members}
        invitations={invitations}
        inviteMembersState={{
          ...inviteMembersState,
          onOpenChange: handleInviteOpenChange,
        }}
        onChangeRole={handleChangeRole}
      />
      <InviteMembers {...inviteMembersState} onOpenChange={handleInviteOpenChange} />
      <InviteMembers
        {...changeRoleState}
        onOpenChange={handleChangeRoleOpenChange}
        mode="change-role"
        member={selectedMember ?? undefined}
      />
    </div>
  );
}
