import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

export type Integration = {
  id: string;
  name: string;
  connected: boolean;
  syncing: boolean;
  lastSynced?: string;
  description: string;
};

export type Agent = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  recentAction?: string;
};

export type AppNotification = {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

type AppStateContextType = {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  integrations: Integration[];
  agents: Agent[];
  chatHistory: Message[];
  notifications: AppNotification[];
  businessHealth: number;
  revenue: number;
  customers: number;
  teamPRs: number;
  login: (email: string, name: string) => void;
  logout: () => void;
  connectIntegration: (id: string) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  toggleAgent: (id: string) => void;
  sendChatMessage: (text: string) => void;
  clearChat: () => void;
  resolveRecommendation: (id: string, text: string) => void;
  clearNotifications: () => void;
};

const defaultIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    connected: false,
    syncing: false,
    description: "Track MRR, invoices, customer billing history, and payouts.",
  },
  {
    id: "github",
    name: "GitHub",
    connected: false,
    syncing: false,
    description: "Track pull requests, commits, issues, and code velocity.",
  },
  {
    id: "slack",
    name: "Slack",
    connected: false,
    syncing: false,
    description: "Monitor team communications, product notifications, and alerts.",
  },
  {
    id: "notion",
    name: "Notion",
    connected: false,
    syncing: false,
    description: "Index company wiki, documentation, project tasks, and roadmaps.",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    connected: false,
    syncing: false,
    description: "Monitor customer pipelines, contacts, deals, and activities.",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    connected: false,
    syncing: false,
    description: "Sync customer support tickets, satisfaction scores, and resolution SLA.",
  },
];

const defaultAgents: Agent[] = [
  {
    id: "marketing",
    name: "Marketing Agent",
    active: true,
    description: "Generates SEO drafts, social posts, and monitors acquisition funnels.",
    recentAction: "Analyzed organic traffic for June (+15%)",
  },
  {
    id: "finance",
    name: "Finance Agent",
    active: true,
    description: "Monitors burn rate, subscription metrics, and flags payment failures.",
    recentAction: "Prepared cashflow forecast for Q3",
  },
  {
    id: "engineering",
    name: "Engineering Agent",
    active: true,
    description: "Runs security audits, tracks code velocity, and checks deployment logs.",
    recentAction: "Flagged dependency vulnerability in package.json",
  },
  {
    id: "sales",
    name: "Sales Agent",
    active: false,
    description: "Leads qualification, generates follow-up emails, and updates deal stages.",
    recentAction: "None",
  },
  {
    id: "support",
    name: "Support Agent",
    active: false,
    description: "Drafts ticket responses, summarizes support logs, and escalates bugs.",
    recentAction: "None",
  },
];

const defaultMessages: Message[] = [
  {
    id: "welcome",
    sender: "assistant",
    text: "Welcome to Startup Copilot OS! I'm your AI co-founder. Connect your business integrations, and I can analyze your metrics, automate workflows, and answer questions about your company.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const defaultNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "Welcome to Startup Copilot OS!",
    time: "Just now",
    read: false,
    type: "info",
  },
  {
    id: "n2",
    title: "Complete your first integration in Settings",
    time: "5 min ago",
    read: false,
    type: "warning",
  },
];

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [chatHistory, setChatHistory] = useState<Message[]>(defaultMessages);
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("copilot_auth");
      const storedUser = localStorage.getItem("copilot_user");
      const storedInts = localStorage.getItem("copilot_integrations");
      const storedAgents = localStorage.getItem("copilot_agents");
      const storedChat = localStorage.getItem("copilot_chat");
      const storedNotifs = localStorage.getItem("copilot_notifs");

      if (storedAuth === "true") setIsAuthenticated(true);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedInts) setIntegrations(JSON.parse(storedInts));
      if (storedAgents) setAgents(JSON.parse(storedAgents));
      if (storedChat) setChatHistory(JSON.parse(storedChat));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    }
  }, []);

  // Save to localStorage helper
  const save = (key: string, value: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  };

  const login = (email: string, name: string) => {
    const newUser = { email, name: name || "Founder" };
    setIsAuthenticated(true);
    setUser(newUser);
    save("copilot_auth", "true");
    save("copilot_user", newUser);

    // Add welcome notification
    const welcomeNotif: AppNotification = {
      id: Math.random().toString(),
      title: `Logged in as ${newUser.name}`,
      time: "Just now",
      read: false,
      type: "success",
    };
    const updated = [welcomeNotif, ...notifications];
    setNotifications(updated);
    save("copilot_notifs", updated);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setIntegrations(defaultIntegrations);
    setAgents(defaultAgents);
    setChatHistory(defaultMessages);
    setNotifications(defaultNotifications);
    if (typeof window !== "undefined") {
      localStorage.removeItem("copilot_auth");
      localStorage.removeItem("copilot_user");
      localStorage.removeItem("copilot_integrations");
      localStorage.removeItem("copilot_agents");
      localStorage.removeItem("copilot_chat");
      localStorage.removeItem("copilot_notifs");
    }
  };

  const connectIntegration = async (id: string) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, syncing: true } : item));
      save("copilot_integrations", updated);
      return updated;
    });

    // Simulate OAuth / sync loader delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              syncing: false,
              connected: true,
              lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : item,
      );
      save("copilot_integrations", updated);
      return updated;
    });

    // Add success notification
    const name = integrations.find((i) => i.id === id)?.name ?? id;
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      title: `${name} synchronized successfully`,
      time: "Just now",
      read: false,
      type: "success",
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      save("copilot_notifs", updated);
      return updated;
    });
  };

  const disconnectIntegration = (id: string) => {
    setIntegrations((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, connected: false, lastSynced: undefined } : item,
      );
      save("copilot_integrations", updated);
      return updated;
    });

    const name = integrations.find((i) => i.id === id)?.name ?? id;
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      title: `${name} disconnected`,
      time: "Just now",
      read: false,
      type: "info",
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      save("copilot_notifs", updated);
      return updated;
    });
  };

  const toggleAgent = (id: string) => {
    setAgents((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              active: !item.active,
              recentAction: !item.active ? "Agent activated and monitoring workspace" : "None",
            }
          : item,
      );
      save("copilot_agents", updated);
      return updated;
    });

    const agent = agents.find((a) => a.id === id);
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      title: `${agent?.name} ${!agent?.active ? "activated" : "deactivated"}`,
      time: "Just now",
      read: false,
      type: "info",
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      save("copilot_notifs", updated);
      return updated;
    });
  };

  const getSimulatedResponse = (text: string): string => {
    const q = text.toLowerCase();
    const isStripe = integrations.find((i) => i.id === "stripe")?.connected;
    const isGithub = integrations.find((i) => i.id === "github")?.connected;
    const isSlack = integrations.find((i) => i.id === "slack")?.connected;
    const isHubspot = integrations.find((i) => i.id === "hubspot")?.connected;

    if (
      q.includes("revenue") ||
      q.includes("mrr") ||
      q.includes("billing") ||
      q.includes("stripe")
    ) {
      if (!isStripe) {
        return "I notice Stripe is not connected. To provide accurate MRR, invoices, and growth analytics, please link your Stripe account in the Integrations panel.";
      }
      return "Stripe billing analytics: Current MRR stands at $248,910, showing +12.4% growth month-over-month. Customer churn has lowered by 1.2% this week, and we have a payout of $42,180 pending.";
    }

    if (
      q.includes("code") ||
      q.includes("github") ||
      q.includes("pr") ||
      q.includes("git") ||
      q.includes("engineering")
    ) {
      if (!isGithub) {
        return "Your GitHub repository is disconnected. Connect GitHub to track PR velocity, open issues, and codebase health.";
      }
      return "GitHub Activity: We currently have 14 active engineers, with 3 PRs successfully merged in the past 24 hours. Code velocity is high, and the main branch is passing all CI checks.";
    }

    if (q.includes("health") || q.includes("business health") || q.includes("score")) {
      const score = Math.round(
        60 + (isStripe ? 10 : 0) + (isGithub ? 10 : 0) + (isSlack ? 8 : 0) + (isHubspot ? 10 : 0),
      );
      let rating = "Good";
      if (score > 85) rating = "Excellent";
      else if (score < 70) rating = "Fair (needs integrations)";

      return `Our Startup Health Score is ${score}/100 (${rating}). Connecting more integrations increases visibility and helps me predict business outcomes. Currently connected: ${
        [isStripe && "Stripe", isGithub && "GitHub", isSlack && "Slack", isHubspot && "HubSpot"]
          .filter(Boolean)
          .join(", ") || "None"
      }.`;
    }

    if (
      q.includes("customer") ||
      q.includes("sales") ||
      q.includes("leads") ||
      q.includes("crm") ||
      q.includes("hubspot")
    ) {
      if (!isHubspot) {
        return "HubSpot CRM is disconnected. Once linked, I will summarize pipeline activity and qualify fresh inbound leads.";
      }
      return "HubSpot CRM Overview: We have 3,204 active customers. Inbound pipeline grew by 14% this week. I've highlighted 3 enterprise deals that are in the decision phase.";
    }

    if (q.includes("slack") || q.includes("message") || q.includes("team")) {
      if (!isSlack) {
        return "Slack is currently disconnected. Link Slack to enable automatic alert notifications and contextual channel summarization.";
      }
      return "Slack notifications: Team channel discussion contains high activity. Main topics discussed are client Q3 onboarding plans and the new database migration scheduled for Friday.";
    }

    // Default conversational responses
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hello! How can I assist you with your startup today? You can ask me about our current "business health", check our "revenue", or see if there are any pending tasks.`;
    }

    if (q.includes("agent") || q.includes("marketing") || q.includes("finance")) {
      const activeCount = agents.filter((a) => a.active).length;
      return `We have ${activeCount} active AI agents operating in the background. You can enable more agents (like Sales or Support) in the Agents Control panel.`;
    }

    return "I've analyzed your query. Without more specific integrations connected, I'm using default repository guidelines. What specific area of your startup (Revenue, Code base, Inbound sales, Support tickets) would you like me to look into?";
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => {
      const updated = [...prev, userMessage];
      save("copilot_chat", updated);

      // Simulate co-founder typing and response
      setTimeout(() => {
        const assistantText = getSimulatedResponse(text);
        const assistantMessage: Message = {
          id: Math.random().toString(),
          sender: "assistant",
          text: assistantText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatHistory((current) => {
          const final = [...current, assistantMessage];
          save("copilot_chat", final);
          return final;
        });
      }, 700);

      return updated;
    });
  };

  const resolveRecommendation = (id: string, text: string) => {
    // Add notification about resolved action
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      title: `Action resolved: ${text}`,
      time: "Just now",
      read: false,
      type: "success",
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      save("copilot_notifs", updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    save("copilot_notifs", []);
  };

  // Dynamic calculations based on integrations state
  const isStripeConnected = integrations.find((i) => i.id === "stripe")?.connected;
  const isGithubConnected = integrations.find((i) => i.id === "github")?.connected;
  const isSlackConnected = integrations.find((i) => i.id === "slack")?.connected;
  const isHubspotConnected = integrations.find((i) => i.id === "hubspot")?.connected;

  const businessHealth = Math.round(
    60 +
      (isStripeConnected ? 10 : 0) +
      (isGithubConnected ? 10 : 0) +
      (isSlackConnected ? 8 : 0) +
      (isHubspotConnected ? 10 : 0),
  );

  const revenue = isStripeConnected ? 248910 : 0;
  const customers = isHubspotConnected ? 3204 : 0;
  const teamPRs = isGithubConnected ? 3 : 0;

  return (
    <AppStateContext.Provider
      value={{
        isAuthenticated,
        user,
        integrations,
        agents,
        chatHistory,
        notifications,
        businessHealth,
        revenue,
        customers,
        teamPRs,
        login,
        logout,
        connectIntegration,
        disconnectIntegration,
        toggleAgent,
        sendChatMessage,
        resolveRecommendation,
        clearNotifications,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
