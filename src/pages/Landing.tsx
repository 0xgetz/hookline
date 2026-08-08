import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Cable,
  Gauge,
  Play,
  RefreshCw,
  Rows3,
  ShieldCheck,
  Sparkles,
  Terminal,
  Webhook,
  Zap,
} from "lucide-react";
import { Badge, Button, MethodBadge } from "../components/ui";

/* ------------------------------- typewriter ------------------------------- */

function useTypewriter(lines: string[], speed = 16) {
  const full = lines.join("\n");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= full.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, full.length, speed]);
  return full.slice(0, count);
}

const DEMO_LINES = [
  "$ curl -X POST https://your-app.convex.site/hook/Ax8p...K2m \\",
  '  -H "content-type: application/json" \\',
  '  -d \'{"event":"deploy","repo":"hookline","status":"success"}\'',
  "",
  "HTTP/1.1 200 OK",
  '{"ok":true,"id":"j3x9k2q7"}',
  "",
  "◈ captured · stored · streaming to your dashboard",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- nav ----------------------------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800/70 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Terminal className="h-4 w-4" />
          </span>
          <span className="font-mono text-sm font-bold tracking-tight text-mist-100">
            hookline
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-mist-500 md:flex">
          <a href="#features" className="transition-colors hover:text-mist-100">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-mist-100">
            How it works
          </a>
          <a href="#use" className="transition-colors hover:text-mist-100">
            Live feed
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-mist-300 transition-colors hover:text-mist-100"
          >
            Sign in
          </Link>
          <Link
            to="/auth?returnTo=/dashboard"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-400 px-3 text-sm font-semibold text-emerald-950 shadow-[0_0_0_1px_rgb(52_211_153/0.4),0_8px_30px_-10px_rgb(52_211_153/0.55)] transition-all hover:bg-emerald-300 active:scale-[0.98]"
          >
            Open dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- hero ----------------------------------- */

function Hero() {
  const typed = useTypewriter(DEMO_LINES);
  const lines = typed.split("\n");

  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge tone="green" className="mb-5 gap-1.5 px-2.5 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> Webhook inspection for builders
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-mist-100 sm:text-5xl lg:text-[3.4rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            Every webhook your app{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              ever receives
            </span>
            , on one screen.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-lg text-base leading-relaxed text-mist-500 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            Hookline gives you a private endpoint that captures requests in real
            time. Inspect payloads, replay events, and forward them anywhere —
            zero infrastructure, zero setup, zero servers.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            <Button size="lg">
              <Link to="/auth?returnTo=/dashboard" className="inline-flex h-12 items-center gap-2">
                Start capturing — free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <a href="#how" className="inline-flex h-12 items-center gap-2">
                <Play className="h-4 w-4" /> See how it works
              </a>
            </Button>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-mist-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span>0 servers to run</span>
            <span className="text-emerald-500/60">·</span>
            <span>30-second setup</span>
            <span className="text-emerald-500/60">·</span>
            <span>1 URL for everything</span>
          </motion.div>
        </div>

        {/* terminal demo */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-emerald-400/5 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-ink-600 bg-ink-900/90 shadow-2xl shadow-black/60 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-ink-700 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 font-mono text-[11px] text-mist-700">
                hookline — live capture
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 h-pulse" />
                listening
              </span>
            </div>
            <div className="p-5 font-mono text-[12.5px] leading-relaxed">
              {lines.map((line, i) => {
                const isMeta = line.startsWith("$") || line.startsWith("HTTP");
                const isSuccess = line.includes("◈");
                return (
                  <div
                    key={i}
                    className={
                      isSuccess
                        ? "text-emerald-400"
                        : isMeta
                          ? "text-mist-100"
                          : "text-mist-500"
                    }
                  >
                    {line === "" ? "\u00A0" : line}
                    {i === lines.length - 1 && (
                      <span className="h-blink text-emerald-400">▌</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-float absolute -right-3 -top-5 hidden rounded-xl border border-ink-600 bg-ink-850 px-3 py-2 font-mono text-[11px] text-mist-300 shadow-xl sm:block">
            <span className="text-emerald-400">POST</span> /hook/Ax8p…K2m
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------- trust strip ------------------------------ */

function TrustStrip() {
  const tools = [
    "GitHub",
    "Stripe",
    "Slack",
    "Twilio",
    "Shopify",
    "Resend",
    "Vercel",
    "Linear",
    "Replicate",
  ];
  return (
    <section className="border-y border-ink-800/70 bg-ink-900/40 py-10">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-mist-700">
            Works with the tools you already ship with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {tools.map((tool) => (
              <span
                key={tool}
                className="font-mono text-sm font-medium text-mist-700 transition-colors hover:text-mist-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- features -------------------------------- */

const FEATURES = [
  {
    icon: Webhook,
    title: "Capture everything",
    desc: "Any method, any path, any body. Full headers, query strings, and payloads up to 250 KB — captured and stored the instant they arrive.",
  },
  {
    icon: Rows3,
    title: "Live event feed",
    desc: "Events stream into your dashboard in real time. Search, filter, and drill into any request without leaving the page.",
  },
  {
    icon: RefreshCw,
    title: "Replay & forward",
    desc: "Replay any captured event to another URL with one click — ideal for debugging integrations, backfilling data, and testing handlers.",
  },
  {
    icon: ShieldCheck,
    title: "Per-endpoint secrets",
    desc: "Every endpoint gets a unique, unguessable secret baked into its URL. Rotate it any time to instantly invalidate old URLs.",
  },
  {
    icon: Gauge,
    title: "Stats at a glance",
    desc: "Daily volume, method breakdown, and last-24h activity — rendered automatically from your live event stream.",
  },
  {
    icon: Zap,
    title: "Zero infrastructure",
    desc: "No servers to run, no queues to maintain. Your endpoint just works, backed by a real-time database that scales with you.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge tone="green" className="mb-4">
          Features
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl">
          Everything between “sent” and “received”
        </h2>
        <p className="mt-4 text-mist-500">
          Stop grepping logs and replaying manual curls. Hookline is the single
          place where every webhook lives.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 0.05}>
            <div className="group h-full rounded-2xl border border-ink-700 bg-ink-900/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_20px_50px_-20px_rgb(52_211_153/0.25)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-emerald-400 transition-colors group-hover:border-emerald-400/40">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-mist-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-500">
                {feature.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ live feed mock ----------------------------- */

const MOCK_EVENTS = [
  { time: "12:04:11", method: "POST", path: "/hook/…K2m", body: 412, status: "200" },
  { time: "12:03:58", method: "POST", path: "/hook/…K2m", body: 87, status: "200" },
  { time: "12:03:40", method: "PUT", path: "/hook/…K2m", body: 1204, status: "200" },
  { time: "12:02:22", method: "DELETE", path: "/hook/…K2m", body: 0, status: "200" },
  { time: "12:01:09", method: "POST", path: "/hook/…K2m", body: 9021, status: "200" },
  { time: "11:59:47", method: "GET", path: "/hook/…K2m/health", body: 0, status: "200" },
];

function LiveFeedMock() {
  return (
    <section id="use" className="border-y border-ink-800/70 bg-ink-900/40 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <Reveal>
          <Badge tone="green" className="mb-4">
            <Activity className="h-3 w-3" /> Live feed
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl">
            Watch your integrations talk
          </h2>
          <p className="mt-4 max-w-md text-mist-500">
            Every request lands in a searchable, real-time feed. Method badges,
            payload sizes, timestamps, and one-click replay — the moment a
            webhook fires, you'll see it here.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Reactive — new events appear instantly, no refresh needed",
              "Deep-links — share any captured event with your team",
              "Raw or pretty — inspect the exact bytes your service sent",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-mist-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-ink-600 bg-ink-900/90 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-ink-700 px-4 py-3">
              <Cable className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-[11px] text-mist-700">
                events — last 15 minutes
              </span>
            </div>
            <div className="divide-y divide-ink-800">
              {MOCK_EVENTS.map((event) => (
                <div
                  key={event.time}
                  className="flex items-center gap-4 px-4 py-3 font-mono text-[12px] transition-colors hover:bg-ink-850"
                >
                  <span className="w-16 shrink-0 text-mist-700">{event.time}</span>
                  <MethodBadge method={event.method} />
                  <span className="min-w-0 flex-1 truncate text-mist-300">
                    {event.path}
                  </span>
                  <span className="hidden w-14 shrink-0 text-right text-mist-700 sm:block">
                    {event.body === 0 ? "—" : `${event.body}B`}
                  </span>
                  <Badge tone="green" className="w-10 justify-center">
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- how it works ------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Create your endpoint",
    desc: "Sign in and hit create. You get a private URL with a unique secret — paste it into any integration.",
    code: `curl https://your-app.convex.site/hook/<your-secret>`,
  },
  {
    n: "02",
    title: "Point integrations at it",
    desc: "Use it as your webhook URL in Stripe, GitHub, Slack, or any service that sends HTTP events.",
    code: `curl -X POST https://your-app.convex.site/hook/<your-secret> \\
  -H "content-type: application/json" \\
  -d '{"event":"deploy","status":"success"}'`,
  },
  {
    n: "03",
    title: "Watch events arrive",
    desc: "Payloads appear in your feed instantly. Inspect, replay, forward, or delete — all from the dashboard.",
    code: `{"ok":true,"id":"j3x9k2q7"}`,
  },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge tone="green" className="mb-4">
          How it works
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl">
          From zero to capturing in three steps
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
              <span className="font-mono text-sm font-bold text-emerald-400">
                {step.n}
              </span>
              <h3 className="mt-3 text-base font-semibold text-mist-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-500">
                {step.desc}
              </p>
              <pre className="mt-5 flex-1 overflow-x-auto rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-[11.5px] leading-relaxed text-mist-300">
                <code>{step.code}</code>
              </pre>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- CTA ------------------------------------ */

function Cta() {
  return (
    <section className="relative overflow-hidden border-t border-ink-800/70 py-24">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[110px]" />
      <Reveal className="relative mx-auto max-w-2xl px-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl">
          Stop guessing which webhook never arrived.
        </h2>
        <p className="mt-4 text-mist-500">
          Create your endpoint in under a minute. Free while you build.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg">
            <Link
              to="/auth?returnTo=/dashboard"
              className="inline-flex h-12 items-center gap-2"
            >
              Create my endpoint <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="ghost">
            <Link to="/auth" className="inline-flex h-12 items-center">
              Sign in
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- footer --------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-ink-800/70 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Terminal className="h-4 w-4" />
          </span>
          <span className="font-mono text-sm font-bold text-mist-100">hookline</span>
        </div>
        <p className="font-mono text-xs text-mist-700">
          © {new Date().getFullYear()} Hookline · Webhook inspection & automation
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------- page ----------------------------------- */

export function Landing() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <Hero />
      <TrustStrip />
      <Features />
      <LiveFeedMock />
      <HowItWorks />
      <Cta />
      <Footer />
    </div>
  );
}
