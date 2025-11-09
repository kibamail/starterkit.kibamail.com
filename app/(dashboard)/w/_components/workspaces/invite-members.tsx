"use client";

import * as Dialog from "@kibamail/owly/dialog";
import { Button } from "@kibamail/owly/button";
import * as TextField from "@kibamail/owly/text-field";
import * as Select from "@kibamail/owly/select-field";
import { Mail } from "iconoir-react";
import type { ToggleState } from "@/hooks/utils/useToggleState";
import { ROLES } from "@/config/rbac";
import { internalApi } from "@/lib/api/client";
import { useOrganization } from "@/lib/contexts/user-context";
import { useMutation } from "@/hooks/use-mutation";
import { useToast } from "@kibamail/owly/toast";

interface InviteMembersProps extends ToggleState {}

const LEAST_PRIVILEGE_ROLE = ROLES[ROLES.length - 1];

export function InviteMembers({ open, onOpenChange }: InviteMembersProps) {
  const workspace = useOrganization();

  const { success: toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return internalApi
        .workspaces()
        .members(workspace?.id as string)
        .invite(data);
    },
    onSuccess(_, variables) {
      onOpenChange?.(false);

      toast(
        `${variables.email} has been invited to join as ${variables.role}.`
      );
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    mutate({ email, role });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>Invite member to workspace</Dialog.Title>
          <Dialog.Description>
            Invite a team member to collaborate in your workspace.
          </Dialog.Description>
        </Dialog.Header>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-kb-content-secondary"
              >
                Email address
              </label>
              <TextField.Root
                id="email"
                name="email"
                type="email"
                placeholder="colleague@example.com"
                required
              >
                <TextField.Slot side="left">
                  <Mail />
                </TextField.Slot>
              </TextField.Root>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium text-kb-content-secondary"
              >
                Role
              </label>
              <Select.Root name="role" defaultValue={LEAST_PRIVILEGE_ROLE.name}>
                <Select.Trigger placeholder="Select role" />
                <Select.Content className="z-50">
                  {ROLES.map((role) => (
                    <Select.Item key={role.name} value={role.name}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.displayName}</span>
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <Dialog.Footer className="flex justify-between">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={isPending}>
              Send invitation
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
