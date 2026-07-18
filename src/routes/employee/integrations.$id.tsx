import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDetailPanel } from "@/components/integration-detail";

export const Route = createFileRoute("/employee/integrations/$id")({
  component: EmployeeIntegrationDetail,
});

function EmployeeIntegrationDetail() {
  const { id } = Route.useParams();
  return <IntegrationDetailPanel integrationId={id} basePath="/employee" />;
}
