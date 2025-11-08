"use client";

import * as Dialog from "@kibamail/owly/dialog";
import { Button } from "@kibamail/owly/button";
import * as TextField from "@kibamail/owly/text-field";
import * as Select from "@kibamail/owly/select-field";
import { Mail, Plus, Trash } from "iconoir-react";
import type { ToggleState } from "@/hooks/utils/useToggleState";
import { useState } from "react";
import { ROLES } from "@/config/rbac";
import { useMutation } from "@tanstack/react-query";
import { internalApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/lib/contexts/user-context";

interface InviteMembersProps extends ToggleState {}

interface MemberInvite {
  id: string;
  email: string;
  role: string;
}

const LEAST_PRIVILEGE_ROLE = ROLES[ROLES.length - 1];

export function InviteMembers({ open, onOpenChange }: InviteMembersProps) {
  const router = useRouter();
  const workspace = useOrganization();

  const [invites, setInvites] = useState<MemberInvite[]>([
    {
      id: crypto.randomUUID(),
      email: "",
      role: LEAST_PRIVILEGE_ROLE.name,
    },
  ]);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (invites: MemberInvite[]) => {
      return internalApi.workspaces().inviteMembers(workspace?.id as string, {
        invites: invites.map((inv) => ({
          email: inv.email,
          role: inv.role,
        })),
      });
    },
    onSuccess: (data) => {
      onOpenChange?.(false);

      setInvites([
        {
          id: crypto.randomUUID(),
          email: "",
          role: LEAST_PRIVILEGE_ROLE.name,
        },
      ]);

      router.refresh();

      // TODO: Show success toast with invitation stats
    },
  });

  function addInviteRow() {
    setInvites([
      ...invites,
      {
        id: crypto.randomUUID(),
        email: "",
        role: LEAST_PRIVILEGE_ROLE.name,
      },
    ]);
  }

  function removeInviteRow(id: string) {
    if (invites.length === 1) {
      return;
    }
    setInvites(invites.filter((invite) => invite.id !== id));
  }

  function updateEmail(id: string, email: string) {
    setInvites(
      invites.map((invite) =>
        invite.id === id ? { ...invite, email } : invite
      )
    );
  }

  function updateRole(id: string, role: string) {
    setInvites(
      invites.map((invite) => (invite.id === id ? { ...invite, role } : invite))
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(invites);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>Invite members to workspace</Dialog.Title>
          <Dialog.Description>
            Invite team members to collaborate in your workspace. You can invite
            multiple people at once.
          </Dialog.Description>
        </Dialog.Header>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-kb-content-secondary">
              <div className="col-span-6">Email address</div>
              <div className="col-span-5">Role</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <TextField.Root
                      type="email"
                      placeholder="colleague@example.com"
                      value={invite.email}
                      onChange={(e) => updateEmail(invite.id, e.target.value)}
                      required
                    >
                      <TextField.Slot side="left">
                        <Mail />
                      </TextField.Slot>
                    </TextField.Root>
                  </div>

                  <div className="col-span-5">
                    <Select.Root
                      value={invite.role}
                      onValueChange={(value) => updateRole(invite.id, value)}
                    >
                      <Select.Trigger placeholder="Select role" />
                      <Select.Content className="z-50">
                        {ROLES.map((role) => (
                          <Select.Item key={role.name} value={role.name}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {role.displayName}
                              </span>
                            </div>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>

                  <div className="col-span-1 flex items-start">
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-10!"
                      onClick={() => removeInviteRow(invite.id)}
                      disabled={invites.length === 1}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Button
                type="button"
                size="sm"
                variant="tertiary"
                onClick={addInviteRow}
              >
                <Plus />
                Add another member
              </Button>
            </div>

            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p className="font-medium">Failed to send invitations</p>
                <p className="text-xs mt-1">
                  {error?.message || "Please try again"}
                </p>
              </div>
            )}
          </div>

          <Dialog.Footer className="flex justify-between">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={isPending}>
              Send {invites.length} invitation{invites.length !== 1 ? "s" : ""}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
