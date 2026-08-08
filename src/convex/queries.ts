import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";

export const getEndpoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const endpoints = await ctx.db
      .query("endpoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return Promise.all(
      endpoints.map(async (endpoint) => {
        const last = await ctx.db
          .query("webhookEvents")
          .withIndex("by_endpoint_time", (q) => q.eq("endpointId", endpoint._id))
          .order("desc")
          .first();
        const events = await ctx.db
          .query("webhookEvents")
          .withIndex("by_endpoint_time", (q) => q.eq("endpointId", endpoint._id))
          .collect();
        return {
          ...endpoint,
          lastEventAt: last?.receivedAt ?? null,
          totalEvents: events.length,
        };
      }),
    );
  },
});

export const listEvents = query({
  args: {
    endpointId: v.id("endpoints"),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { endpointId, cursor }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { events: [], cursor: null, isDone: true };
    const endpoint = await ctx.db.get(endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      return { events: [], cursor: null, isDone: true };
    }
    const result = await ctx.db
      .query("webhookEvents")
      .withIndex("by_endpoint_time", (q) => q.eq("endpointId", endpointId))
      .order("desc")
      .paginate({ numItems: 30, cursor: cursor ?? null });
    return {
      events: result.page,
      cursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

export const getEvent = query({
  args: { eventId: v.id("webhookEvents") },
  handler: async (ctx, { eventId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const event = await ctx.db.get(eventId);
    if (!event || event.userId !== userId) return null;
    return event;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ? { name: user.name, email: user.email } : null;
  },
});

export const getStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 14 }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { points: [], methods: [], total: 0, last24h: 0 };

    const cutoff = Date.now() - days * 86_400_000;
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_user_time", (q) => q.eq("userId", userId).gte("receivedAt", cutoff))
      .collect();

    const byDay = new Map<string, number>();
    const methods = new Map<string, number>();
    let last24h = 0;

    for (const event of events) {
      const day = new Date(event.receivedAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      methods.set(event.method, (methods.get(event.method) ?? 0) + 1);
      if (event.receivedAt >= Date.now() - 86_400_000) last24h += 1;
    }

    // Fill in every day of the window so the chart is continuous.
    const points: { label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
      points.push({ label: d, count: byDay.get(d) ?? 0 });
    }

    return {
      points,
      methods: Array.from(methods.entries()).map(([method, count]) => ({ method, count })),
      total: events.length,
      last24h,
    };
  },
});
