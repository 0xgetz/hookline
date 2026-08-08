import { useMemo, useState } from "react";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Inbox, Search } from "lucide-react";
import { Badge, Button, EmptyState, MethodBadge, Spinner } from "../ui";
import { formatBytes, timeAgo } from "../../lib/utils";

type Event = Doc<"webhookEvents">;

export function EventFeed({
  events,
  loading,
  isDone,
  onLoadMore,
  onSelect,
}: {
  events: Event[];
  loading: boolean;
  isDone: boolean;
  onLoadMore: () => void;
  onSelect: (id: Id<"webhookEvents">) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.method.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q),
    );
  }, [events, query]);

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 px-5 py-4">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold text-mist-100">
          <Inbox className="h-4 w-4 text-emerald-400" /> Event feed
          <Badge tone="green">{events.length}</Badge>
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-700" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by method or path…"
            className="h-9 w-full rounded-xl border border-ink-600 bg-ink-850 pl-9 pr-3 text-sm text-mist-100 placeholder:text-mist-700 focus:border-emerald-400/70 focus:outline-none"
          />
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : events.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title="No webhooks yet"
            description="Events sent to your endpoint will appear here instantly. Hit “Send test event” above to see it in action."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="No matches"
            description={`Nothing matches “${query}”. Try a method like POST or part of a path.`}
          />
        </div>
      ) : (
        <div>
          <ul className="divide-y divide-ink-800">
            {filtered.map((event) => (
              <li key={event._id}>
                <button
                  onClick={() => onSelect(event._id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left font-mono text-[12.5px] transition-colors hover:bg-ink-850"
                >
                  <span className="w-14 shrink-0 text-mist-700">
                    {timeAgo(event.receivedAt)}
                  </span>
                  <MethodBadge method={event.method} />
                  <span className="min-w-0 flex-1 truncate text-mist-300">
                    {event.path}
                  </span>
                  <span className="hidden w-14 shrink-0 text-right text-mist-700 sm:block">
                    {event.body ? formatBytes(event.body.length) : "—"}
                  </span>
                  {event.forwardedStatus !== undefined &&
                  event.forwardedStatus !== null ? (
                    <Badge tone={event.forwardedStatus < 400 ? "green" : "rose"}>
                      fwd {event.forwardedStatus}
                    </Badge>
                  ) : (
                    <span className="hidden w-10 text-center text-mist-700 sm:block">
                      —
                    </span>
                  )}
                  <Badge tone="zinc" className="hidden md:inline-flex">
                    {event.headers && event.headers["content-type"]
                      ? String(event.headers["content-type"]).split(";")[0]
                      : "—"}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
          {!isDone && (
            <div className="border-t border-ink-800 p-4 text-center">
              <Button variant="secondary" size="sm" onClick={onLoadMore}>
                Load more events
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
