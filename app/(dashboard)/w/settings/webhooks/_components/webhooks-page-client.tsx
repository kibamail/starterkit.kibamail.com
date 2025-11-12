"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WebhooksTable } from "@/webhooks/_components/webhooks-table";
import type { WebhookDestination } from "@/webhooks/client/types";

interface WebhooksPageClientProps {
  destinations: WebhookDestination[];
}

export function WebhooksPageClient({ destinations }: WebhooksPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Refresh the route to fetch webhook data in the layout
    router.refresh();
  }, [router]);

  return <WebhooksTable destinations={destinations} />;
}
