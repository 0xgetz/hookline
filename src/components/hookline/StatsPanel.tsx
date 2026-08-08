import { BarChart3 } from "lucide-react";
import { Badge, Spinner } from "../ui";
import { cn } from "../../lib/utils";

export type Stats = {
  points: { label: string; count: number }[];
  methods: { method: string; count: number }[];
  total: number;
  last24h: number;
};

export function StatsPanel({
  stats,
  loading,
}: {
  stats: Stats | undefined;
  loading: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-700 bg-ink-900/60">
        <Spinner />
      </div>
    );
  }

  const max = Math.max(1, ...stats.points.map((p) => p.count));
  const topMethod = [...stats.methods].sort((a, b) => b.count - a.count)[0];

  const cards = [
    { label: "Total events", value: stats.total.toLocaleString() },
    { label: "Last 24 hours", value: stats.last24h.toLocaleString() },
    {
      label: "Top method",
      value: topMethod ? `${topMethod.method} · ${topMethod.count}` : "—",
    },
  ];

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold text-mist-100">
          <BarChart3 className="h-4 w-4 text-emerald-400" /> Traffic — last 14
          days
        </h2>
        <div className="flex gap-2">
          {stats.methods.map((m) => (
            <Badge key={m.method} tone="green">
              {m.method} {m.count}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-ink-700 bg-ink-850 px-4 py-3"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-mist-700">
              {card.label}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-mist-100">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex h-28 items-end gap-[3px]">
        {stats.points.map((point) => (
          <div key={point.label} className="group relative flex-1">
            <div
              className={cn(
                "w-full rounded-t-[3px] transition-all duration-200",
                point.count > 0
                  ? "bg-gradient-to-t from-emerald-500/70 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300"
                  : "bg-ink-700",
              )}
              style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-ink-600 bg-ink-850 px-2 py-1 font-mono text-[10px] text-mist-100 opacity-0 transition-opacity group-hover:opacity-100">
              {point.count} · {point.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-mist-700">
        <span>14d ago</span>
        <span>today</span>
      </div>
    </div>
  );
}
