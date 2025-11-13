"use client";

import {
  DashboardLayoutSidebarGroup,
  DashboardLayoutSidebarItem,
} from "@kibamail/owly/dashboard-layout";
import { HomeAltSlimHoriz, Settings } from "iconoir-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar Navigation
 *
 * Client component that handles sidebar navigation with active state detection.
 * Manually checks pathname to determine which navigation item is active.
 */
export function SidebarNavigation() {
  const pathname = usePathname();

  const isSettingsActive = pathname.startsWith("/w/settings");

  return (
    <DashboardLayoutSidebarGroup>
      <DashboardLayoutSidebarItem asChild active={!isSettingsActive}>
        <Link href="/w/">
          <HomeAltSlimHoriz />
          Dashboard
        </Link>
      </DashboardLayoutSidebarItem>
      <DashboardLayoutSidebarItem asChild active={isSettingsActive}>
        <Link href="/w/settings">
          <Settings />
          Settings
        </Link>
      </DashboardLayoutSidebarItem>
    </DashboardLayoutSidebarGroup>
  );
}
