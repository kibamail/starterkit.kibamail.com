import type { PropsWithChildren } from "react";

export default function WebhooksLayout({ children }: PropsWithChildren) {
  // Context is now provided at the settings layout level
  return <>{children}</>;
}
