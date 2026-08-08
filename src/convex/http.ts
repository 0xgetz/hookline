import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-allow-headers": "*",
};

const MAX_BODY = 250_000;

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });

// POST/GET/PUT/PATCH/DELETE .../hook/<secret> captures and stores the request.
const captureWebhook = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (segments[0] !== "hook" || segments.length < 2) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  const secret = segments[1];
  const endpoint = await ctx.runQuery(internal.webhooks.findEndpointBySecret, {
    secret,
  });

  if (!endpoint) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  const raw = await request.text();
  const body = raw.length > MAX_BODY ? raw.slice(0, MAX_BODY) : raw;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const eventId = await ctx.runMutation(internal.webhooks.storeEvent, {
    endpointId: endpoint._id,
    userId: endpoint.userId,
    method: request.method,
    path: url.pathname + url.search,
    headers,
    query,
    body: body === "" ? undefined : body,
    receivedAt: Date.now(),
    sourceIp: headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? undefined,
  });

  if (endpoint.forwardEnabled && endpoint.forwardTarget) {
    try {
      await ctx.runAction(api.webhooks.forwardEvent, {
        eventId,
        targetUrl: endpoint.forwardTarget,
      });
    } catch (e) {
      await ctx.runMutation(internal.webhooks.markForwarded, {
        eventId,
        status: 0,
        error: e instanceof Error ? e.message : "forward failed",
      });
    }
  }

  return json({ ok: true, id: eventId }, 200);
});

const health = httpAction(async () =>
  json({ ok: true, service: "hookline" }, 200),
);

const http = httpRouter();

const CAPTURE_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] as const;

for (const method of CAPTURE_METHODS) {
  http.route({ pathPrefix: "/hook/", method, handler: captureWebhook });
}

auth.addHttpRoutes(http);
http.route({ path: "/health", method: "GET", handler: health });

export default http;
