import { v, ConvexError } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

function randomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const createEndpoint = mutation({
  args: { label: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const existing = await ctx.db
      .query("endpoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.length >= 5) {
      throw new ConvexError("Free plan allows up to 5 endpoints.");
    }
    return await ctx.db.insert("endpoints", {
      userId,
      label: args.label?.trim() || "Default endpoint",
      secret: randomSecret(),
      createdAt: Date.now(),
      forwardEnabled: false,
    });
  },
});

export const rotateEndpointSecret = mutation({
  args: { endpointId: v.id("endpoints") },
  handler: async (ctx, { endpointId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const endpoint = await ctx.db.get(endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new ConvexError("Endpoint not found.");
    }
    await ctx.db.patch(endpointId, { secret: randomSecret() });
  },
});

export const updateEndpoint = mutation({
  args: {
    endpointId: v.id("endpoints"),
    label: v.optional(v.string()),
    forwardTarget: v.optional(v.string()),
    forwardEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new ConvexError("Endpoint not found.");
    }
    const patch: Record<string, unknown> = {};
    if (args.label !== undefined) {
      patch.label = args.label.trim() || endpoint.label;
    }
    if (args.forwardTarget !== undefined) {
      patch.forwardTarget = args.forwardTarget.trim() || undefined;
    }
    if (args.forwardEnabled !== undefined) {
      patch.forwardEnabled = args.forwardEnabled;
    }
    await ctx.db.patch(args.endpointId, patch);
  },
});

export const deleteEndpoint = mutation({
  args: { endpointId: v.id("endpoints") },
  handler: async (ctx, { endpointId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const endpoint = await ctx.db.get(endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new ConvexError("Endpoint not found.");
    }
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_endpoint_time", (q) => q.eq("endpointId", endpointId))
      .collect();
    for (const event of events) await ctx.db.delete(event._id);
    await ctx.db.delete(endpointId);
  },
});

export const clearEndpointEvents = mutation({
  args: { endpointId: v.id("endpoints") },
  handler: async (ctx, { endpointId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const endpoint = await ctx.db.get(endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new ConvexError("Endpoint not found.");
    }
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_endpoint_time", (q) => q.eq("endpointId", endpointId))
      .collect();
    for (const event of events) await ctx.db.delete(event._id);
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("webhookEvents") },
  handler: async (ctx, { eventId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to continue.");
    const event = await ctx.db.get(eventId);
    if (!event || event.userId !== userId) throw new ConvexError("Event not found.");
    await ctx.db.delete(eventId);
  },
});

// Replays a captured event to a target URL.
export const forwardEvent = action({
  args: { eventId: v.id("webhookEvents"), targetUrl: v.string() },
  handler: async (ctx, { eventId, targetUrl }) => {
    const event = await ctx.runQuery(internal.webhooks.fetchEventForForward, { eventId });
    if (!event) return { status: 404, error: "Event not found" };

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return { status: 400, error: "Invalid target URL" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { status: 400, error: "Only http(s) targets are allowed" };
    }

    const headers: Record<string, string> = {
      "content-type":
        (event.headers && event.headers["content-type"]) || "application/json",
      "user-agent": "Hookline/1.0",
    };

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: event.method,
        headers,
        body: event.body ?? undefined,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Network error";
      await ctx.runMutation(internal.webhooks.markForwarded, {
        eventId,
        status: 0,
        error: message,
      });
      return { status: 0, error: message };
    }

    await ctx.runMutation(internal.webhooks.markForwarded, {
      eventId,
      status: response.status,
    });
    return { status: response.status };
  },
});

export const findEndpointBySecret = internalQuery({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) =>
    await ctx.db
      .query("endpoints")
      .withIndex("by_secret", (q) => q.eq("secret", secret))
      .unique(),
});

export const fetchEventForForward = internalQuery({
  args: { eventId: v.id("webhookEvents") },
  handler: async (ctx, { eventId }) => await ctx.db.get(eventId),
});

export const markForwarded = internalMutation({
  args: {
    eventId: v.id("webhookEvents"),
    status: v.number(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      forwardedAt: Date.now(),
      forwardedStatus: args.status,
    };
    if (args.error !== undefined) patch.forwardedError = args.error;
    await ctx.db.patch(args.eventId, patch);
  },
});

export const storeEvent = internalMutation({
  args: {
    endpointId: v.id("endpoints"),
    userId: v.string(),
    method: v.string(),
    path: v.string(),
    headers: v.any(),
    query: v.any(),
    body: v.optional(v.string()),
    receivedAt: v.number(),
    sourceIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => await ctx.db.insert("webhookEvents", args),
});
