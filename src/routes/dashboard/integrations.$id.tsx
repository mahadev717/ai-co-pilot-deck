import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDetailPanel } from "@/components/integration-detail";

export const Route = createFileRoute("/dashboard/integrations/$id")({
  component: DashboardIntegrationDetail,
});

function DashboardIntegrationDetail() {
  const { id } = Route.useParams();
  return <IntegrationDetailPanel integrationId={id} basePath="/dashboard" />;
}
