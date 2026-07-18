import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import { activeEngine } from "@/lib/gemini";
import { checkAgentSearch } from "@/lib/agent-search-api";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Zap,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/dashboard/chat")({
  component: AIFounderChat,
});

/** Lightweight markdown renderer for AI responses */
function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="mt-2 font-semibold text-foreground first:mt-0">
              {line.replace("## ", "")}
            </p>
          );
        }
        if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
          return (
            <p key={i} className="font-semibold text-foreground">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow" />
              <span className="text-foreground/90">{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.match(/^\| .+ \|/)) {
          return (
            <div key={i} className="font-mono text-[11px] text-muted-foreground">
              {line}
            </div>
          );
        }
        if (line.startsWith("```")) {
          return (
            <code
              key={i}
              className="block rounded border border-border/30 bg-black/40 px-3 py-2 font-mono text-[11px] text-brand-glow"
            >
              {line.replace(/```\w*/g, "")}
            </code>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-foreground/90">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-black/30 px-1 py-0.5 font-mono text-[11px] text-brand-glow"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function TypingIndicator() {
  return (
    <div className="mr-auto flex max-w-[80%] items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-brand-bg">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="glass rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-brand-glow"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function AIFounderChat() {
  const { chatHistory, sendChatMessage, clearChat, isTyping } = useAppState();
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastSpokenId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const engine = activeEngine();
  const engineLabel =
    engine === "openai"
      ? "GPT-4o Mini — Live"
      : engine === "gemini"
        ? "Gemini 2.0 Flash — Live"
        : "Smart Mock AI — Demo Mode";
  const engineLive = engine !== "mock";
  const [searchOnline, setSearchOnline] = useState<boolean | null>(null);

  useEffect(() => {
    setVoiceSupported(Boolean(getSpeechRecognition()) || typeof window !== "undefined");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    void checkAgentSearch()
      .then((r) => setSearchOnline(r.ok))
      .catch(() => setSearchOnline(false));
  }, []);

  // Speak newest assistant reply when voice-out is on
  useEffect(() => {
    if (!voiceOut || typeof window === "undefined" || !window.speechSynthesis) return;
    const last = [...chatHistory].reverse().find((m) => m.sender === "assistant");
    if (!last || last.id === lastSpokenId.current || last.id === "welcome") return;
    lastSpokenId.current = last.id;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      last.text.replace(/[#*`|_]/g, " ").replace(/\s+/g, " ").slice(0, 600),
    );
    utter.rate = 1.02;
    window.speechSynthesis.speak(utter);
  }, [chatHistory, voiceOut]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggleListen = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setInput((prev) =>
        prev || "Voice input needs Chrome/Edge. Type your question here instead.",
      );
      return;
    }
    if (listening) {
      stopListening();
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) setInput(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    stopListening();
    sendChatMessage(input.trim());
    setInput("");
  };

  const quickPrompts = [
    "What's our business health?",
    "Analyze connected GitHub repos",
    "Explain Stripe and churn risk",
    "What should I focus on today?",
    "Summarize all connected integrations",
    "Search latest AI startup funding news",
  ];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-2xl border border-border glass-strong md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand-bg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Co-founder</h3>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${engineLive ? "bg-emerald-400" : "bg-yellow-400"}`}
                />
                {engineLabel}
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Mic className="h-3 w-3" /> Text + voice
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    searchOnline === null
                      ? "bg-muted-foreground"
                      : searchOnline
                        ? "bg-emerald-400"
                        : "bg-yellow-400"
                  }`}
                />
                {searchOnline === null
                  ? "Search…"
                  : searchOnline
                    ? "AgentSearch live"
                    : "Search fallback (DDG)"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title={voiceOut ? "Mute AI voice" : "Speak AI replies"}
            onClick={() => {
              setVoiceOut((v) => !v);
              if (typeof window !== "undefined") window.speechSynthesis?.cancel();
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            id="chat-clear-btn"
            onClick={clearChat}
            title="Clear chat"
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => {
            const isAssistant = msg.sender === "assistant";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3.5 ${
                  isAssistant ? "mr-auto max-w-[85%]" : "ml-auto max-w-[75%] flex-row-reverse"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isAssistant ? "gradient-brand-bg text-primary-foreground" : "bg-white/10"
                  }`}
                >
                  {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className="min-w-0 space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isAssistant
                        ? "glass text-foreground"
                        : "gradient-brand-bg text-primary-foreground shadow-glow"
                    }`}
                  >
                    {isAssistant ? (
                      <MarkdownText text={msg.text} />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                  <p
                    className={`text-[9px] text-muted-foreground ${
                      isAssistant ? "pl-1 text-left" : "pr-1 text-right"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/40 bg-white/[0.02] px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => !isTyping && sendChatMessage(prompt)}
              disabled={isTyping}
              className="rounded-full border border-border/80 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2.5 border-t border-border/60 bg-white/5 p-4"
      >
        <button
          type="button"
          onClick={toggleListen}
          disabled={isTyping}
          title={listening ? "Stop listening" : "Speak your question"}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors disabled:opacity-50 ${
            listening
              ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
              : "border-border bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          {listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          id="chat-input"
          type="text"
          placeholder={
            listening
              ? "Listening… speak now"
              : isTyping
                ? "AI is thinking…"
                : voiceSupported
                  ? "Type or tap the mic to talk…"
                  : "Ask anything about your startup…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10 disabled:opacity-50"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-bg text-primary-foreground ring-glow transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
        >
          {isTyping ? <Zap className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
