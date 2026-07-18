import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDetailPanel } from "@/components/integration-detail";

// Flat route (integrations_.$id) so this is a sibling of /integrations,
// not a nested child — otherwise the list page would swallow navigation.
export const Route = createFileRoute("/dashboard/integrations_/$id")({
  component: DashboardIntegrationDetail,
});

function DashboardIntegrationDetail() {
  const { id } = Route.useParams();
  return <IntegrationDetailPanel integrationId={id} basePath="/dashboard" />;
}
