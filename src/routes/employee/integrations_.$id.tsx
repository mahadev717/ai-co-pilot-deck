import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDetailPanel } from "@/components/integration-detail";

// Flat route so tool dashboards are siblings of the integrations list.
export const Route = createFileRoute("/employee/integrations_/$id")({
  component: EmployeeIntegrationDetail,
});

function EmployeeIntegrationDetail() {
  const { id } = Route.useParams();
  return <IntegrationDetailPanel integrationId={id} basePath="/employee" />;
}
