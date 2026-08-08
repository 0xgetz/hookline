import { useEffect, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  Braces,
  Globe,
  Play,
  Rows3,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  Button,
  CodeBlock,
  CopyButton,
  Drawer,
  Input,
  Label,
  MethodBadge,
} from "../ui";
import { cn, formatBytes, formatTime, isValidUrl, prettyJson } from "../../lib/utils";

type Event = Doc<"webhookEvents">;

type Tab = "body" | "headers" | "query";

export function EventDetail({
  event,
  onClose,
}: {
  event: Event | null | undefined;
  onClose: () => void;
}) {
  const forwardEvent = useAction(api.webhooks.forwardEvent);
  const deleteEvent = useMutation(api.webhooks.deleteEvent);

  const [tab, setTab] = useState<Tab>("body");
  const [target, setTarget] = useState("");
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<{
    status?: number;
    error?: string;
  } | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!event) return;
    setTab("body");
    setTarget("");
    setReplayResult(null);
    setArmed(false);
  }, [event?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3200);
    return () => clearTimeout(t);
  }, [armed]);

  if (!event) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;

  const current = event;

  const prettyBody = (() => {
    if (!event.body) return "(empty body)";
    try {
      return prettyJson(JSON.parse(event.body));
    } catch {
      return event.body;
    }
  })();

  async function handleReplay() {
    if (!isValidUrl(target)) {
      setReplayResult({ error: "Enter a valid http(s) URL" });
      return;
    }
    setReplaying(true);
    setReplayResult(null);
    try {
      const result = await forwardEvent({ eventId: current._id, targetUrl: target });
      setReplayResult(result);
    } catch (err) {
      setReplayResult({
        error: err instanceof Error ? err.message : "Replay failed",
      });
    } finally {
      setReplaying(false);
    }
  }

  async function handleDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    await deleteEvent({ eventId: current._id });
    onClose();
  }

  const tabs: { key: Tab; label: string; icon: typeof Braces }[] = [
    { key: "body", label: "Body", icon: Braces },
    { key: "headers", label: "Headers", icon: Rows3 },
    { key: "query", label: "Query", icon: Globe },
  ];

  return (
    <Drawer
      open={true}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <MethodBadge method={event.method} />
          <span className="truncate">{event.path}</span>
        </span>
      }
    >
      {/* meta */}
      <div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-mist-700">
        <span>{formatTime(event.receivedAt)}</span>
        <span>·</span>
        <span>{event.body ? formatBytes(event.body.length) : "0 B"}</span>
        {event.sourceIp && (
          <>
            <span>·</span>
            <span>from {event.sourceIp}</span>
          </>
        )}
      </div>

      {/* forward status */}
      {event.forwardedAt !== undefined && event.forwardedAt !== null && (
        <div
          className={cn(
            "mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 font-mono text-xs",
            event.forwardedStatus !== undefined && event.forwardedStatus < 400
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300",
          )}
        >
          {event.forwardedStatus !== undefined &&
          event.forwardedStatus < 400 ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <TriangleAlert className="h-3.5 w-3.5" />
          )}
          {event.forwardedError
            ? `Forward failed: ${event.forwardedError}`
            : `Forwarded · upstream replied ${event.forwardedStatus}`}
        </div>
      )}

      {/* tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs transition-colors",
              tab === t.key
                ? "bg-emerald-400/15 text-emerald-300"
                : "text-mist-500 hover:text-mist-100",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "body" && (
        <div className="relative">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton value={prettyBody} label="Copy payload" />
          </div>
          <CodeBlock code={prettyBody} maxHeight="max-h-[45vh]" />
        </div>
      )}

      {tab === "headers" && (
        <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
          <div className="max-h-[45vh] overflow-auto">
            <table className="w-full font-mono text-[12px]">
              <tbody className="divide-y divide-ink-800">
                {Object.entries(event.headers ?? {}).map(([key, value]) => (
                  <tr key={key} className="align-top">
                    <td className="w-1/3 shrink-0 px-4 py-2 text-emerald-400/90">
                      {key}
                    </td>
                    <td className="break-all px-4 py-2 text-mist-300">
                      {String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "query" &&
        (Object.keys(event.query ?? {}).length === 0 ? (
          <p className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-xs text-mist-700">
            No query parameters
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
            <div className="max-h-[45vh] overflow-auto">
              <table className="w-full font-mono text-[12px]">
                <tbody className="divide-y divide-ink-800">
                  {Object.entries(event.query ?? {}).map(([key, value]) => (
                    <tr key={key} className="align-top">
                      <td className="w-1/3 shrink-0 px-4 py-2 text-emerald-400/90">
                        {key}
                      </td>
                      <td className="break-all px-4 py-2 text-mist-300">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* replay */}
      <div className="mt-6 rounded-xl border border-ink-700 bg-ink-850 p-4">
        <Label>Replay this event to</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://api.example.com/hooks"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleReplay();
            }}
          />
          <Button
            onClick={() => void handleReplay()}
            loading={replaying}
            className="shrink-0"
          >
            <Play className="h-3.5 w-3.5" /> Replay
          </Button>
        </div>
        {replayResult && (
          <p
            className={cn(
              "mt-3 font-mono text-xs",
              replayResult.error
                ? "text-rose-300"
                : replayResult.status !== undefined && replayResult.status < 400
                  ? "text-emerald-300"
                  : "text-amber-300",
            )}
          >
            {replayResult.error ??
              `Upstream responded ${replayResult.status}`}
          </p>
        )}
      </div>

      {/* delete */}
      <div className="mt-6 flex items-center justify-between">
        <p className="font-mono text-[11px] text-mist-700">
          id {event._id}
        </p>
        <Button variant="danger" size="sm" onClick={() => void handleDelete()}>
          <Trash2 className="h-3.5 w-3.5" />
          {armed ? "Delete this event?" : "Delete event"}
        </Button>
      </div>
    </Drawer>
  );
}
