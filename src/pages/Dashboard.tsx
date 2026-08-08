import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { LogOut, Plus, Terminal, Webhook } from "lucide-react";
import { Button, EmptyState, Spinner } from "../components/ui";
import { EndpointPanel } from "../components/hookline/EndpointPanel";
import { StatsPanel } from "../components/hookline/StatsPanel";
import { EventFeed } from "../components/hookline/EventFeed";
import { EventDetail } from "../components/hookline/EventDetail";

export function Dashboard() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  const me = useQuery(api.queries.me);
  const endpoints = useQuery(api.queries.getEndpoints);
  const stats = useQuery(api.queries.getStats, { days: 14 });

  const [activeId, setActiveId] = useState<Id<"endpoints"> | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<Id<"webhookEvents"> | null>(null);

  const activeEndpointId = activeId ?? endpoints?.[0]?._id ?? null;

  useEffect(() => {
    setCursor(null);
    setSelectedEventId(null);
  }, [activeEndpointId]);

  const eventsData = useQuery(
    api.queries.listEvents,
    activeEndpointId
      ? { endpointId: activeEndpointId, cursor: cursor ?? undefined }
      : "skip",
  );
  const selectedEvent = useQuery(
    api.queries.getEvent,
    selectedEventId ? { eventId: selectedEventId } : "skip",
  );

  const createEndpoint = useMutation(api.webhooks.createEndpoint);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const id = await createEndpoint({});
      setActiveId(id);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-ink-800/70 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                <Terminal className="h-4 w-4" />
              </span>
              <span className="font-mono text-sm font-bold text-mist-100">
                hookline
              </span>
            </Link>
            <span className="ml-2 rounded-md border border-ink-700 bg-ink-850 px-2 py-0.5 font-mono text-[11px] text-mist-500">
              dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-44 truncate font-mono text-xs text-mist-700 sm:block">
              {me?.email}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-600 bg-ink-850 font-mono text-xs font-bold text-emerald-400">
              {(me?.name ?? "U").slice(0, 1).toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              disabled={!isAuthenticated}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {endpoints === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : endpoints.length === 0 ? (
          <EmptyState
            icon={<Webhook className="h-5 w-5" />}
            title="Create your first endpoint"
            description="You'll get a private URL with a unique secret. Point any integration at it and watch events stream in."
            action={
              <Button onClick={() => void handleCreate()} loading={creating}>
                <Plus className="h-4 w-4" /> Create endpoint
              </Button>
            }
          />
        ) : (
          <>
            <EndpointPanel
              endpoints={endpoints}
              activeId={activeEndpointId}
              onSelect={(id) => setActiveId(id)}
            />
            <StatsPanel stats={stats} loading={stats === undefined} />
            <EventFeed
              events={eventsData?.events ?? []}
              loading={eventsData === undefined}
              isDone={eventsData?.isDone ?? true}
              onLoadMore={() => setCursor(eventsData?.cursor ?? null)}
              onSelect={setSelectedEventId}
            />
          </>
        )}
      </main>

      <EventDetail event={selectedEvent} onClose={() => setSelectedEventId(null)} />
    </div>
  );
}
