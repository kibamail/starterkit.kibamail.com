"use client";

import {
  DashboardLayoutContentHeader,
  DashboardLayoutStickyContentHeaderContainer,
} from "@kibamail/owly/dashboard-layout";
import * as Tabs from "@kibamail/owly/tabs";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { SettingsTabs } from "./settings-tabs";

/**
 * Settings Tabs Container
 *
 * Client component that wraps the settings layout with tabs functionality.
 * Detects the active tab from the current pathname.
 */
export function SettingsTabsContainer({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Extract the active tab from pathname
  // e.g., "/w/settings/usage" -> "usage"
  const segments = pathname.split("/");
  const activeTab = segments[segments.length - 1] || "usage";

  return (
    <Tabs.Root variant="secondary" className="w-full!" value={activeTab}>
      <DashboardLayoutStickyContentHeaderContainer>
        <DashboardLayoutContentHeader title="Settings" />

        <SettingsTabs />
      </DashboardLayoutStickyContentHeaderContainer>

      {children}
    </Tabs.Root>
  );
}
