import { useEffect, useState } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, X } from "lucide-react";
import { cn } from "../lib/utils";

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-400 text-emerald-950 font-semibold hover:bg-emerald-300 shadow-[0_0_0_1px_rgb(52_211_153/0.4),0_8px_30px_-10px_rgb(52_211_153/0.55)]",
  secondary:
    "bg-ink-800 text-mist-100 hover:bg-ink-700 border border-ink-600",
  ghost: "text-mist-300 hover:text-mist-100 hover:bg-ink-800",
  danger:
    "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20",
  outline:
    "border border-ink-600 text-mist-100 hover:border-emerald-400/60 hover:text-emerald-300",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  loading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------------------------------- Input ---------------------------------- */

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-ink-600 bg-ink-850 px-3.5 text-sm text-mist-100 placeholder:text-mist-700 transition-colors focus:border-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/20",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium tracking-wide text-mist-500",
        className,
      )}
    >
      {children}
    </label>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

type BadgeTone = "green" | "sky" | "amber" | "violet" | "rose" | "zinc";

const badgeTones: Record<BadgeTone, string> = {
  green: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  sky: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  violet: "bg-violet-400/10 text-violet-300 border-violet-400/25",
  rose: "bg-rose-400/10 text-rose-300 border-rose-400/25",
  zinc: "bg-ink-700/60 text-mist-500 border-ink-600",
};

export function Badge({
  tone = "zinc",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Method badge ------------------------------ */

const methodTone: Record<string, BadgeTone> = {
  GET: "green",
  POST: "sky",
  PUT: "amber",
  PATCH: "violet",
  DELETE: "rose",
};

export function MethodBadge({ method }: { method: string }) {
  return <Badge tone={methodTone[method] ?? "zinc"}>{method}</Badge>;
}

/* ------------------------------- CopyButton ------------------------------- */

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-2.5 py-1.5 font-mono text-[11px] text-mist-300 transition-colors hover:border-emerald-400/50 hover:text-emerald-300",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* -------------------------------- Spinner --------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-emerald-400", className)}
    />
  );
}

/* -------------------------------- CodeBlock ------------------------------- */

export function CodeBlock({
  code,
  maxHeight = "max-h-[55vh]",
  className,
}: {
  code: string;
  maxHeight?: string;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "overflow-auto rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-[12.5px] leading-relaxed text-mist-300",
        maxHeight,
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  );
}

/* --------------------------------- Drawer ---------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-ink-700 bg-ink-900 shadow-2xl",
              width,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-ink-700 bg-ink-900/95 px-5 py-4 backdrop-blur">
              <div className="min-w-0 truncate font-mono text-sm font-semibold text-mist-100">
                {title}
              </div>
              <button
                onClick={onClose}
                className="ml-3 cursor-pointer rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-ink-800 hover:text-mist-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-600 bg-ink-900/60 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-600 bg-ink-800 text-emerald-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-mist-100">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-mist-500">
        {description}
      </p>
      {action}
    </div>
  );
}
