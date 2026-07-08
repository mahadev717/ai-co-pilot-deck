import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import { Send, Sparkles, Bot, User, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/dashboard/chat")({
  component: AIFounderChat,
});

function AIFounderChat() {
  const { chatHistory, sendChatMessage, clearChat } = useAppState();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput("");
  };

  const quickPrompts = [
    "What's our business health?",
    "Check Stripe billing status",
    "How is our code quality?",
    "Summarize support tickets",
  ];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-2xl glass-strong border border-border overflow-hidden md:h-[calc(100vh-6rem)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand-bg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Copilot OS Assistant</h3>
            <p className="text-[10px] text-muted-foreground">
              Active model: Co-founder LLM Stack (Reasoning Mode)
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 max-w-[80%] ${
                isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold ${
                  isAssistant ? "gradient-brand-bg text-primary-foreground" : "bg-white/10"
                }`}
              >
                {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Speech bubble */}
              <div className="space-y-1">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAssistant
                      ? "glass text-foreground"
                      : "gradient-brand-bg text-primary-foreground shadow-glow"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-[9px] text-muted-foreground ${isAssistant ? "text-left" : "text-right"}`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="border-t border-border/40 bg-white/[0.02] px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendChatMessage(prompt)}
              className="rounded-full border border-border/80 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSend} className="border-t border-border/60 bg-white/5 p-4 flex gap-2.5">
        <input
          type="text"
          placeholder="Ask anything about your startup..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-bg text-primary-foreground ring-glow hover:scale-[1.03] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:scale-100"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
