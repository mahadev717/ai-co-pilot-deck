import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/components/Landing";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Startup Copilot OS — Your AI Co-founder for Smarter Startups" },
      {
        name: "description",
        content:
          "Startup Copilot OS is the AI operating system that connects every business tool into one intelligent platform — predict problems, automate operations, and help founders decide faster.",
      },
      { property: "og:title", content: "Startup Copilot OS — Your AI Co-founder for Smarter Startups" },
      {
        property: "og:description",
        content:
          "Startup Copilot OS is the AI operating system that connects every business tool into one intelligent platform — predict problems, automate operations, and help founders decide faster.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Startup Copilot OS — Your AI Co-founder for Smarter Startups" },
      {
        name: "twitter:description",
        content: "Startup Copilot OS is the AI operating system that connects every business tool into one intelligent platform — predict problems, automate operations, and help founders decide faster.",
      },
    ],
  }),
});
