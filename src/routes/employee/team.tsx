import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "../dashboard/team";

export const Route = createFileRoute("/employee/team")({
  component: TeamPage,
});
