import { createFileRoute } from "@tanstack/react-router";
import { AgentsManager } from "../dashboard/agents";

export const Route = createFileRoute("/employee/agents")({
  component: AgentsManager,
});
