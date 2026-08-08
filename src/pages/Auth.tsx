import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRight, Lock, Mail, ShieldCheck, Terminal, UserRound } from "lucide-react";
import { Button, Input, Label } from "../components/ui";
import { cn } from "../lib/utils";

type Mode = "signin" | "signup";

export function Auth() {
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signIn("password", {
          email: email.trim(),
          password,
          name: name.trim(),
          flow: "signUp",
        });
      } else {
        await signIn("password", {
          email: email.trim(),
          password,
          flow: "signIn",
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-5 py-16">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-mist-100 transition-opacity hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </span>
            <span className="font-mono text-base font-bold tracking-tight">
              hookline
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-mist-500">
            {mode === "signin"
              ? "Sign in to inspect your webhook traffic."
              : "Create an account and get your private webhook endpoint in seconds."}
          </p>
        </div>

        <div className="rounded-2xl border border-ink-600 bg-ink-900/90 p-6 shadow-2xl shadow-black/50 backdrop-blur">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-emerald-400 text-emerald-950"
                    : "text-mist-500 hover:text-mist-100",
                )}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label>Name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-700" />
                  <Input
                    className="pl-10"
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-700" />
                <Input
                  className="pl-10"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-700" />
                <Input
                  className="pl-10"
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {mode === "signin" ? "Sign in" : "Create account"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[11px] text-mist-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Passwords are hashed and scoped to your workspace
        </p>
      </motion.div>
    </div>
  );
}
