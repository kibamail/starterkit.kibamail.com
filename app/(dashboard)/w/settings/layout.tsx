import type { PropsWithChildren } from "react";
import { SettingsTabsContainer } from "./_components/settings-tabs-container";

export default function SettingsLayout({ children }: PropsWithChildren) {
  return <SettingsTabsContainer>{children}</SettingsTabsContainer>;
}
