import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import {
  Cable,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Webhook,
} from "lucide-react";
import { Badge, Button, CopyButton, Input, Label } from "../ui";
import { cn, SITE_URL, timeAgo } from "../../lib/utils";

export type EndpointWithStats = Doc<"endpoints"> & {
  lastEventAt: number | null;
  totalEvents: number;
};

export function EndpointPanel({
  endpoints,
  activeId,
  onSelect,
}: {
  endpoints: EndpointWithStats[];
  activeId: Id<"endpoints"> | null;
  onSelect: (id: Id<"endpoints"> | null) => void;
}) {
  const createEndpoint = useMutation(api.webhooks.createEndpoint);
  const rotateEndpointSecret = useMutation(api.webhooks.rotateEndpointSecret);
  const updateEndpoint = useMutation(api.webhooks.updateEndpoint);
  const deleteEndpoint = useMutation(api.webhooks.deleteEndpoint);
  const clearEndpointEvents = useMutation(api.webhooks.clearEndpointEvents);

  const [labelDraft, setLabelDraft] = useState("");
  const [forwardTarget, setForwardTarget] = useState("");
  const [forwardEnabled, setForwardEnabled] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);

  const endpoint = endpoints.find((e) => e._id === activeId) ?? null;

  useEffect(() => {
    if (!endpoint) return;
    setLabelDraft(endpoint.label);
    setForwardTarget(endpoint.forwardTarget ?? "");
    setForwardEnabled(endpoint.forwardEnabled);
  }, [endpoint?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(null), 3200);
    return () => clearTimeout(t);
  }, [armed]);

  async function handleCreate() {
    setCreating(true);
    try {
      const id = await createEndpoint({});
      onSelect(id);
    } finally {
      setCreating(false);
    }
  }

  async function handleRotate() {
    if (!endpoint) return;
    if (armed !== "rotate") {
      setArmed("rotate");
      return;
    }
    setArmed(null);
    await rotateEndpointSecret({ endpointId: endpoint._id });
  }

  async function handleDelete() {
    if (!endpoint) return;
    if (armed !== "delete") {
      setArmed("delete");
      return;
    }
    setArmed(null);
    await deleteEndpoint({ endpointId: endpoint._id });
    const remaining = endpoints.filter((e) => e._id !== endpoint._id);
    onSelect(remaining[0]?._id ?? null);
  }

  async function handleClear() {
    if (!endpoint) return;
    if (armed !== "clear") {
      setArmed("clear");
      return;
    }
    setArmed(null);
    await clearEndpointEvents({ endpointId: endpoint._id });
  }

  async function sendTest() {
    if (!endpoint) return;
    setSending(true);
    try {
      await fetch(`${SITE_URL}/hook/${endpoint.secret}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hookline-source": "dashboard-test",
        },
        body: JSON.stringify({
          event: "hookline.ping",
          source: "dashboard",
          ts: Date.now(),
        }),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 px-5 py-4">
        <h2 className="flex items-center gap-2 font-mono text-sm font-semibold text-mist-100">
          <Cable className="h-4 w-4 text-emerald-400" /> Endpoints
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void handleCreate()}
          loading={creating}
          disabled={endpoints.length >= 5}
        >
          <Plus className="h-3.5 w-3.5" /> New endpoint
          {endpoints.length >= 5 && (
            <span className="text-mist-700">(max 5)</span>
          )}
        </Button>
      </div>

      {/* endpoint chips */}
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        {endpoints.map((ep) => (
          <button
            key={ep._id}
            onClick={() => onSelect(ep._id)}
            className={cn(
              "group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all",
              ep._id === activeId
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-ink-600 bg-ink-850 hover:border-ink-500",
            )}
          >
            <Webhook className="h-3.5 w-3.5 text-emerald-400" />
            <span className="max-w-36 truncate text-sm font-medium text-mist-100">
              {ep.label}
            </span>
            <Badge tone={ep._id === activeId ? "green" : "zinc"}>
              {ep.totalEvents}
            </Badge>
          </button>
        ))}
      </div>

      {endpoint && (
        <div className="space-y-6 px-5 py-5">
          {/* label + URL */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={() => {
                  if (labelDraft.trim() && labelDraft !== endpoint.label) {
                    void updateEndpoint({
                      endpointId: endpoint._id,
                      label: labelDraft.trim(),
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            <div>
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-xl border border-ink-600 bg-ink-950 px-3.5 py-2.5 font-mono text-xs text-mist-300">
                  {SITE_URL}/hook/{endpoint.secret}
                </code>
                <CopyButton value={`${SITE_URL}/hook/${endpoint.secret}`} />
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleRotate()}
              loading={false}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {armed === "rotate" ? "Rotate now?" : "Rotate secret"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void handleClear()}
              loading={false}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {armed === "clear" ? "Clear all events?" : "Clear events"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => void handleDelete()}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {armed === "delete" ? "Delete endpoint?" : "Delete endpoint"}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => void sendTest()}
              loading={sending}
            >
              <Send className="h-3.5 w-3.5" />
              Send test event
            </Button>
            {endpoint.lastEventAt ? (
              <span className="font-mono text-[11px] text-mist-700">
                last event {timeAgo(endpoint.lastEventAt)}
              </span>
            ) : (
              <span className="font-mono text-[11px] text-mist-700">
                no events yet
              </span>
            )}
          </div>

          {/* forwarding */}
          <div className="rounded-xl border border-ink-700 bg-ink-850 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={forwardEnabled}
                  onClick={() => {
                    const next = !forwardEnabled;
                    setForwardEnabled(next);
                    void updateEndpoint({
                      endpointId: endpoint._id,
                      forwardEnabled: next,
                    });
                  }}
                  className={cn(
                    "relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors",
                    forwardEnabled
                      ? "border-emerald-400/60 bg-emerald-400/80"
                      : "border-ink-600 bg-ink-700",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      forwardEnabled ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-mist-100">
                    Auto-forward every event
                  </p>
                  <p className="font-mono text-[11px] text-mist-700">
                    relays each captured request to your target URL
                  </p>
                </div>
              </div>
              <div className="flex w-full items-center gap-2 lg:w-auto">
                <Input
                  className="lg:w-72"
                  placeholder="https://api.example.com/hooks"
                  value={forwardTarget}
                  onChange={(e) => setForwardTarget(e.target.value)}
                  onBlur={() => {
                    if (forwardTarget !== endpoint.forwardTarget) {
                      void updateEndpoint({
                        endpointId: endpoint._id,
                        forwardTarget,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
