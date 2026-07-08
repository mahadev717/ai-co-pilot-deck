import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sparkles, ArrowRight, Play, Bot, Zap, LineChart, LayoutDashboard, Network, Users,
  Slack, Github, Mail, CreditCard, BarChart3, MessageSquare, FileText, Database,
  Check, X, Menu, ChevronDown, Star, TrendingUp, Bell, Activity, DollarSign,
  ShieldCheck, Rocket, Building2, Twitter, Linkedin, Github as GithubIcon,
} from "lucide-react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";

/* ---------- helpers ---------- */

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);
  useEffect(() => spring.on("change", (v) => setVal(v)), [spring]);
  return <span ref={ref}>{Math.round(val)}{suffix}</span>;
}

/* ---------- nav ---------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    ["Features", "#features"],
    ["How it works", "#how"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
  ] as const;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-background/60 border-b border-border" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg ring-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Startup Copilot <span className="gradient-text">OS</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Sign in</a>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-2 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:scale-[1.03]"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3 px-6 py-4">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                {label}
              </a>
            ))}
            <a href="#pricing" className="mt-2 inline-flex items-center justify-center rounded-full gradient-brand-bg px-4 py-2 text-sm font-medium text-primary-foreground">
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- particles ---------- */

function Particles() {
  const dots = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const size = 2 + Math.random() * 4;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 6;
        const dur = 6 + Math.random() * 8;
        const purple = Math.random() > 0.5;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: purple ? "oklch(0.75 0.2 300)" : "oklch(0.75 0.18 260)",
              boxShadow: `0 0 ${size * 4}px ${purple ? "oklch(0.7 0.2 300)" : "oklch(0.7 0.18 260)"}`,
              opacity: 0.5,
              animation: `float ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------- hero dashboard mock ---------- */

function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="relative"
    >
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand/30 to-brand-2/30 blur-2xl" />
      <div className="glass-strong rounded-2xl p-4 sm:p-5">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs text-muted-foreground">copilot.os / overview</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {/* Health score */}
          <div className="glass col-span-2 row-span-2 flex flex-col justify-between rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Business Health</div>
            <div className="relative mx-auto my-2 h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="oklch(1 0 0 / 0.1)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="42" stroke="url(#g)" strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray="264"
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - 264 * 0.87 }}
                  transition={{ duration: 1.6, delay: 0.6 }}
                />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.2 260)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 305)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-semibold">87</span>
                <span className="text-[10px] text-muted-foreground">Excellent</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">vs last week</span>
              <span className="text-emerald-400">+4.2%</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="glass col-span-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Revenue (MRR)</div>
                <div className="font-display text-2xl font-semibold">$248,910</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" /> 12.4%
              </div>
            </div>
            {/* sparkline */}
            <svg viewBox="0 0 300 60" className="mt-3 h-14 w-full">
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.2 285)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="oklch(0.7 0.2 285)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,45 L30,40 L60,42 L90,30 L120,34 L150,22 L180,26 L210,14 L240,20 L270,10 L300,6"
                fill="none" stroke="oklch(0.75 0.2 285)" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }}
              />
              <motion.path
                d="M0,45 L30,40 L60,42 L90,30 L120,34 L150,22 L180,26 L210,14 L240,20 L270,10 L300,6 L300,60 L0,60 Z"
                fill="url(#fill)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}
              />
            </svg>
          </div>

          {/* Team activity */}
          <div className="glass col-span-2 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Team activity
            </div>
            <div className="mt-3 flex -space-x-2">
              {["oklch(0.7 0.2 285)","oklch(0.75 0.15 200)","oklch(0.72 0.18 30)","oklch(0.7 0.2 340)"].map((c,i)=>(
                <div key={i} className="h-7 w-7 rounded-full border-2 border-card" style={{background:c}}/>
              ))}
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px]">+9</div>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">14 active now · 3 PRs merged</div>
          </div>

          {/* Customer growth */}
          <div className="glass col-span-2 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Customers
            </div>
            <div className="mt-2 font-display text-xl font-semibold">3,204</div>
            <div className="mt-2 flex h-8 items-end gap-1">
              {[30,45,38,60,52,72,68,85,78,92].map((h,i)=>(
                <motion.div key={i}
                  initial={{height:0}} animate={{height:`${h}%`}} transition={{duration:0.6, delay:0.5+i*0.05}}
                  className="w-full rounded-sm gradient-brand-bg opacity-80"/>
              ))}
            </div>
          </div>

          {/* AI recommendation */}
          <div className="glass col-span-2 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-3.5 w-3.5" /> AI recommendation
            </div>
            <p className="mt-2 text-xs leading-relaxed">
              Churn risk detected in <span className="text-foreground">3 enterprise accounts</span>. Suggested: schedule QBRs this week.
            </p>
            <button className="mt-2 text-[11px] gradient-text font-medium">Review action →</button>
          </div>

          {/* Notifications */}
          <div className="glass col-span-6 flex items-center justify-between rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg">
                <Bell className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs">Stripe payout confirmed · $42,180</div>
                <div className="text-[10px] text-muted-foreground">2 min ago</div>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">3 new</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- sections ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <Particles />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span className="text-muted-foreground">Now in private beta · YC-backed founders using it daily</span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your AI <span className="gradient-text">Co-founder</span> for Building Smarter Startups
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Startup Copilot OS connects all your business tools into one intelligent AI platform that understands your company,
              predicts problems, automates operations, and helps founders make better decisions.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full gradient-brand-bg px-5 py-3 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:scale-[1.03]">
                Get Started <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10">
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({length:5}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"/>)}
                <span className="ml-1">4.9 from 300+ founders</span>
              </div>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">SOC 2 Type II</span>
            </div>
          </Reveal>
        </div>
        <div className="relative">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const problems = [
    { icon: Database, title: "Scattered data", text: "Info trapped across 20+ apps and spreadsheets." },
    { icon: LayoutDashboard, title: "App switching", text: "Hours lost jumping between dashboards every day." },
    { icon: Zap, title: "Manual busywork", text: "Repetitive tasks that no one wants to own." },
    { icon: Activity, title: "Slow decisions", text: "Reports take days. Momentum dies waiting." },
    { icon: TrendingUp, title: "Missed opportunities", text: "Signals buried under noise across teams." },
    { icon: Users, title: "Poor collaboration", text: "Context lives in DMs, not where work happens." },
    { icon: ShieldCheck, title: "Founder burnout", text: "You become the human integration layer." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">
              Startups don't need more tools.
            </h2>
            <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl gradient-text">
              They need one intelligence layer.
            </h3>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.04}>
              <div className="group glass h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-brand-glow transition-colors group-hover:gradient-brand-bg group-hover:text-primary-foreground">
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-medium">{p.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{p.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const tools = [
    { icon: Slack, name: "Slack" },
    { icon: Github, name: "GitHub" },
    { icon: FileText, name: "Notion" },
    { icon: Mail, name: "Gmail" },
    { icon: Users, name: "CRM" },
    { icon: CreditCard, name: "Stripe" },
    { icon: BarChart3, name: "Analytics" },
    { icon: MessageSquare, name: "Support" },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-brand-glow" /> The Operating System
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Meet <span className="gradient-text">Startup Copilot OS</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A single AI-powered operating system that understands your business and turns every tool into intelligence.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col items-center gap-8">
          <Reveal>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {tools.map((t) => (
                <div key={t.name} className="glass flex h-16 w-16 flex-col items-center justify-center rounded-xl">
                  <t.icon className="h-5 w-5 text-brand-glow" />
                  <span className="mt-1 text-[10px] text-muted-foreground">{t.name}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="flex flex-col items-center">
            <div className="h-10 w-px bg-gradient-to-b from-transparent to-brand" />
            <Reveal>
              <div className="glass-strong ring-glow flex items-center gap-3 rounded-2xl px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-bg">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">AI Intelligence Engine</div>
                  <div className="text-xs text-muted-foreground">Context · Reasoning · Automation</div>
                </div>
              </div>
            </Reveal>
            <div className="h-10 w-px bg-gradient-to-b from-brand-2 to-transparent" />
          </div>

          <Reveal>
            <div className="glass flex items-center gap-3 rounded-2xl px-6 py-4">
              <LayoutDashboard className="h-5 w-5 text-brand-glow" />
              <div className="text-sm font-medium">One Unified Dashboard</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Bot, title: "AI Business Assistant", text: "Ask anything about your company in natural language and get instant, contextual answers." },
    { icon: Zap, title: "Smart Workflow Automation", text: "Automate repetitive business operations with AI agents that learn how you work." },
    { icon: LineChart, title: "Predictive Analytics", text: "Identify churn, revenue risks and opportunities before they happen." },
    { icon: LayoutDashboard, title: "Unified Dashboard", text: "See every department — sales, product, ops — in one live view." },
    { icon: Network, title: "Knowledge Graph", text: "Every doc, customer, meeting and decision automatically connected." },
    { icon: Users, title: "Multi-Agent AI", text: "Dedicated agents for Marketing, HR, Sales, Finance, Engineering and Support." },
  ];
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Rocket className="h-3 w-3 text-brand-glow" /> Features
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Everything a founder needs, <span className="gradient-text">in one system</span>
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-brand-bg">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                {f.title === "Multi-Agent AI" && (
                  <div className="relative mt-4 flex flex-wrap gap-1.5">
                    {["Marketing","HR","Sales","Finance","Engineering","Support"].map((a)=>(
                      <span key={a} className="rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { t: "Connect Business Tools", d: "One-click integrations with 20+ platforms." },
    { t: "AI Collects Company Data", d: "Secure, private sync — you own everything." },
    { t: "Understands Business Context", d: "Builds a live knowledge graph of your company." },
    { t: "Predicts Insights", d: "Surfaces risks, wins and next best actions." },
    { t: "Automates Workflows", d: "Multi-agent AI runs operations in the background." },
    { t: "Helps Founders Decide", d: "Clear recommendations, always with context." },
  ];
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="mt-4 text-muted-foreground">From connect to autonomous in under 10 minutes.</p>
          </div>
        </Reveal>
        <div className="relative mt-16">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand via-brand-2 to-transparent sm:left-1/2" />
          <div className="space-y-10">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <Reveal key={s.t} delay={i * 0.05}>
                  <div className={`relative flex items-start gap-6 sm:justify-${left ? "start" : "end"}`}>
                    <div className={`hidden sm:block sm:w-1/2 ${left ? "pr-10 text-right" : "order-2 pl-10"}`}>
                      <div className="glass inline-block rounded-2xl p-5 text-left">
                        <div className="text-xs text-brand-glow">Step {i + 1}</div>
                        <div className="mt-1 font-semibold">{s.t}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                      </div>
                    </div>
                    <div className="absolute left-6 flex h-3 w-3 -translate-x-1/2 items-center justify-center sm:left-1/2">
                      <span className="h-3 w-3 rounded-full gradient-brand-bg ring-4 ring-background" />
                    </div>
                    <div className="pl-12 sm:hidden">
                      <div className="glass rounded-2xl p-5">
                        <div className="text-xs text-brand-glow">Step {i + 1}</div>
                        <div className="mt-1 font-semibold">{s.t}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const rows = [
    ["Multiple dashboards", "One AI platform"],
    ["Manual reports", "Real-time intelligence"],
    ["Reactive decisions", "Predictive insights"],
    ["Fragmented information", "Autonomous automation"],
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">
              Why choose <span className="gradient-text">Copilot OS</span>
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <div className="text-sm text-muted-foreground">Traditional tools</div>
              <ul className="mt-4 space-y-3">
                {rows.map(([bad]) => (
                  <li key={bad} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-muted-foreground">{bad}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-strong ring-glow rounded-2xl p-6">
              <div className="inline-flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-brand-glow" />
                <span className="gradient-text font-medium">Startup Copilot OS</span>
              </div>
              <ul className="mt-4 space-y-3">
                {rows.map(([, good]) => (
                  <li key={good} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{good}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { n: 20, s: "+", l: "Connected platforms" },
    { n: 95, s: "%", l: "Faster decisions" },
    { n: 70, s: "%", l: "Less manual work" },
    { n: 24, s: "/7", l: "AI assistance" },
  ];
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass-strong grid grid-cols-2 gap-6 rounded-3xl p-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-4xl font-semibold gradient-text sm:text-5xl">
                <Counter to={s.n} suffix={s.s} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Maya Chen", role: "CEO, Lumen AI",
      quote: "It's like hiring a chief of staff on day one. We killed 6 SaaS subscriptions in our first month.",
      color: "oklch(0.72 0.2 300)",
    },
    {
      name: "Daniel Osei", role: "Co-founder, Northwind Labs",
      quote: "The predictive churn signals alone paid for the product 10x over. It just sees things we miss.",
      color: "oklch(0.7 0.18 220)",
    },
    {
      name: "Priya Raman", role: "Founder, Ferrous",
      quote: "Feels like the OS founders always deserved. Every metric, every tool, one calm dashboard.",
      color: "oklch(0.72 0.18 30)",
    },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Loved by <span className="gradient-text">founders</span></h2>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <div className="glass h-full rounded-2xl p-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({length:5}).map((_,j)=><Star key={j} className="h-4 w-4 fill-yellow-400"/>)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full font-medium text-primary-foreground"
                    style={{ background: `linear-gradient(135deg, ${t.color}, oklch(0.6 0.22 285))` }}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter", price: "$49", period: "/mo",
      desc: "For early-stage startups finding product-market fit.",
      features: ["Up to 5 seats","5 integrations","AI assistant","Basic automation","Community support"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Professional", price: "$199", period: "/mo",
      desc: "For growing teams that need real intelligence.",
      features: ["Up to 25 seats","Unlimited integrations","Multi-agent AI","Predictive analytics","Workflow automation","Priority support"],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", period: "",
      desc: "Custom AI solutions for scaled companies.",
      features: ["Unlimited seats","Dedicated AI models","SSO / SAML","On-prem knowledge graph","Custom agents","24/7 SLA"],
      cta: "Talk to sales",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Simple, <span className="gradient-text">honest pricing</span></h2>
            <p className="mt-4 text-muted-foreground">Start free. Scale when the intelligence pays for itself.</p>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05}>
              <div className={`relative h-full rounded-2xl p-7 ${p.highlight ? "glass-strong ring-glow" : "glass"}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-brand-bg px-3 py-0.5 text-[11px] font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <a href="#" className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                  p.highlight ? "gradient-brand-bg text-primary-foreground" : "glass text-foreground hover:bg-white/10"
                }`}>
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 text-brand-glow" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "What is Startup Copilot OS?", a: "It's an AI operating system that unifies your business tools — Slack, GitHub, Stripe, CRM, and more — into one intelligent layer that reasons about your company." },
    { q: "How long does setup take?", a: "Most teams are live in under 10 minutes. One-click integrations sync securely and the AI starts building context immediately." },
    { q: "Is my company data secure?", a: "Yes. We're SOC 2 Type II compliant, encrypt data at rest and in transit, and never train shared models on your data." },
    { q: "Which tools do you integrate with?", a: "20+ platforms including Slack, GitHub, Notion, Gmail, HubSpot, Salesforce, Stripe, Linear, Intercom, Zendesk, Jira and more." },
    { q: "Can I bring my own AI models?", a: "Enterprise customers can bring their own models or run fully on-prem. Everyone else uses our tuned multi-agent stack." },
    { q: "Do you offer a free trial?", a: "Yes — Professional includes a 14-day free trial. Starter has a generous free tier for teams under 3 people." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Frequently asked <span className="gradient-text">questions</span></h2>
          </div>
        </Reveal>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.03}>
              <div className="glass overflow-hidden rounded-2xl">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full gradient-brand-bg blur-3xl opacity-40" />
          </div>
          <Building2 className="relative mx-auto h-8 w-8 text-brand-glow" />
          <h2 className="relative mt-4 font-display text-3xl font-semibold sm:text-5xl">
            Give your startup an <span className="gradient-text">AI co-founder</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            Join hundreds of founders shipping smarter with Startup Copilot OS.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full gradient-brand-bg px-5 py-3 text-sm font-medium text-primary-foreground ring-glow hover:scale-[1.03] transition-transform">
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-medium hover:bg-white/10">
              <Play className="h-4 w-4" /> Watch Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Product", links: ["Features","Pricing","Integrations","Changelog"] },
    { title: "Company", links: ["About","Careers","Contact","Blog"] },
    { title: "Legal", links: ["Privacy Policy","Terms","Security","DPA"] },
  ];
  return (
    <footer className="relative border-t border-border pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">Startup Copilot <span className="gradient-text">OS</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The AI operating system for modern startups. Connect every tool, unlock every insight.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Linkedin, GithubIcon].map((I, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass transition-colors hover:bg-white/10">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-medium">{c.title}</div>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Startup Copilot OS. All rights reserved.</div>
          <div>Made for founders who ship.</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <WhyUs />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
