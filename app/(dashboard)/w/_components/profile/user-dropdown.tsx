"use client";

import * as UserDropdown from "@kibamail/owly/user-dropdown";
import { LetterAvatar } from "@kibamail/owly/letter-avatar";

import type { UserSession } from "@/lib/auth/get-session";
import { CreateWorkspace } from "../workspaces/create-workspace";
import { InviteMembers } from "../workspaces/invite-members";
import { useToggleState } from "@/hooks/utils/useToggleState";
import { Plus, Mail, LogOut } from "iconoir-react";
import { useMutation } from "@tanstack/react-query";
import { internalApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useToast } from "@kibamail/owly/toast";
import { signOutAction } from "@/app/(auth)/actions/sign-out";

interface UserDropdownComponentProps {
  session: UserSession;
}

export function UserSessionDropdown({ session }: UserDropdownComponentProps) {
  const createWorkspaceState = useToggleState();
  const inviteMembersState = useToggleState();

  const toast = useToast();

  const router = useRouter();

  const { mutate: activateWorkspace } = useMutation({
    async mutationFn(workspaceId: string) {
      const t = toast.loading("Switching workspaces...");
      await internalApi.workspaces().activate(workspaceId);

      toast.dismiss(t);
    },
    onSuccess(_, workspaceId) {
      const workspace = session.organizations.find(
        (org) => org.id === workspaceId
      );
      toast.success(`Switched to workspace ${workspace?.name}`);
      router.refresh();
    },
  });

  return (
    <>
      <UserDropdown.Root>
        <UserDropdown.Trigger>
          <LetterAvatar size="small" color="info">
            {session?.user?.name || session?.user?.email}
          </LetterAvatar>
          <span>{session.currentOrganization?.name || session.user.email}</span>
        </UserDropdown.Trigger>

        <UserDropdown.Content>
          {session.organizations.map((org) => {
            const selected = org.id === session.currentOrganization?.id;
            return (
              <UserDropdown.Item
                key={org.id}
                selected={selected}
                onClick={() => activateWorkspace(org.id)}
              >
                <LetterAvatar size="small" color="info">
                  {org.name.slice(0, 2).toUpperCase()}
                </LetterAvatar>
                {org.name}
              </UserDropdown.Item>
            );
          })}
          <UserDropdown.Divider />
          <UserDropdown.Item
            onClick={() => createWorkspaceState.onOpenChange?.(true)}
          >
            <Plus />
            New workspace
          </UserDropdown.Item>
          <UserDropdown.Item
            onClick={() => inviteMembersState.onOpenChange?.(true)}
          >
            <Mail />
            Invite members
          </UserDropdown.Item>

          <UserDropdown.Divider />

          <UserDropdown.Item onClick={signOutAction}>
            <LogOut />
            Sign out
          </UserDropdown.Item>
        </UserDropdown.Content>
      </UserDropdown.Root>

      <CreateWorkspace {...createWorkspaceState} />
      <InviteMembers {...inviteMembersState} />
    </>
  );
}
