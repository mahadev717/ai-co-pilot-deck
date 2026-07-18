import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsManager } from "../dashboard/integrations";

export const Route = createFileRoute("/employee/integrations")({
  component: IntegrationsManager,
});
