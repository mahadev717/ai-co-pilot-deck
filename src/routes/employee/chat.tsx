import { createFileRoute } from "@tanstack/react-router";
import { AIFounderChat } from "../dashboard/chat";

export const Route = createFileRoute("/employee/chat")({
  component: AIFounderChat,
});
