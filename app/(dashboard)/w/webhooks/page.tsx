import { getSession } from "@/lib/auth/get-session";
import { outpost } from "@/webhooks/client/client";
import { CreateWebhookButton } from "@/webhooks/_components/create-webhook-button";
import { WebhooksTable } from "@/webhooks/_components/webhooks-table";
import type {
  WebhookDestination,
  WebhookDestinationType,
} from "@/webhooks/client/types";
import { DashboardLayoutContentActions } from "@kibamail/owly/dashboard-layout";
import { DashboardLayoutContentHeader } from "@kibamail/owly/dashboard-layout";
import { DashboardLayoutStickyContentHeaderContainer } from "@kibamail/owly/dashboard-layout";

export default async function WebhooksPage() {
  const ctx = await getSession();

  const tenant = await outpost
    .tenants(ctx.currentOrganization?.id as string)
    .upsert();

  const tenantId = tenant?.id as string;

  const destinationTypes = await outpost
    .tenants(tenantId)
    .destinations()
    .types();

  const topics = await outpost.topics().list();

  const destinations = await outpost.tenants(tenantId).destinations().list();

  const destinationsWithoutSecrets =
    destinations?.map(({ credentials, ...destination }) => destination) || [];

  return (
    <DashboardLayoutStickyContentHeaderContainer>
      <DashboardLayoutContentHeader title="Webhooks">
        <DashboardLayoutContentActions>
          <CreateWebhookButton
            destinationTypes={
              (destinationTypes || []) as WebhookDestinationType[]
            }
            topics={topics || []}
          />
        </DashboardLayoutContentActions>
      </DashboardLayoutContentHeader>

      <WebhooksTable
        destinations={destinationsWithoutSecrets as WebhookDestination[]}
      />
    </DashboardLayoutStickyContentHeaderContainer>
  );
}
