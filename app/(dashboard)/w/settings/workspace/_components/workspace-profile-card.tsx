"use client";

import { Button } from "@kibamail/owly/button";
import { LetterAvatar } from "@kibamail/owly/letter-avatar";
import * as SettingsCard from "@kibamail/owly/settings-card";
import * as TextField from "@kibamail/owly/text-field";
import { CloudUpload } from "iconoir-react";

interface WorkspaceProfileCardProps {
  workspaceName: string;
  workspaceAvatar?: string | null;
}

export function WorkspaceProfileCard({
  workspaceName,
  workspaceAvatar,
}: WorkspaceProfileCardProps) {
  const handleSaveChanges = () => {
    // TODO: Implement save changes functionality
    console.log("Save changes");
  };

  const handleUpdateAvatar = () => {
    // TODO: Implement avatar upload functionality
    console.log("Update avatar");
  };

  return (
    <SettingsCard.Root>
      <SettingsCard.Header>
        <div>
          <h3 className="text-lg font-semibold text-kb-content-primary">
            Workspace profile
          </h3>
          <p className="text-sm text-kb-content-secondary mt-1">
            Update your workspace name and avatar
          </p>
        </div>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-6">
          {/* Workspace Avatar */}
          <div className="space-y-2">
            <label
              htmlFor="workspace-avatar"
              className="text-sm font-medium text-kb-content-secondary"
            >
              Workspace avatar
            </label>
            <div className="flex items-center gap-4">
              {workspaceAvatar ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={workspaceAvatar}
                    alt="Workspace avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <LetterAvatar size="medium" color="info">
                  {workspaceName}
                </LetterAvatar>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUpdateAvatar}
              >
                <CloudUpload className="w-4 h-4" />
                Update image
              </Button>
            </div>
          </div>

          {/* Workspace Name */}
          <div className="space-y-2">
            <label
              htmlFor="workspace-name"
              className="text-sm font-medium text-kb-content-secondary"
            >
              Workspace name
            </label>
            <TextField.Root
              id="workspace-name"
              name="workspace-name"
              type="text"
              defaultValue={workspaceName}
              placeholder="Enter workspace name"
            />
          </div>
        </div>
      </SettingsCard.Content>

      <SettingsCard.Footer>
        <div className="w-full flex items-center justify-end">
          <Button variant="primary" size="sm" onClick={handleSaveChanges}>
            Save changes
          </Button>
        </div>
      </SettingsCard.Footer>
    </SettingsCard.Root>
  );
}
