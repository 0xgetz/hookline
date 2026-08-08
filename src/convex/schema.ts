import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  endpoints: defineTable({
    userId: v.string(),
    label: v.string(),
    secret: v.string(),
    createdAt: v.number(),
    forwardTarget: v.optional(v.string()),
    forwardEnabled: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_secret", ["secret"]),

  webhookEvents: defineTable({
    endpointId: v.id("endpoints"),
    userId: v.string(),
    method: v.string(),
    path: v.string(),
    headers: v.any(),
    query: v.any(),
    body: v.optional(v.string()),
    receivedAt: v.number(),
    sourceIp: v.optional(v.string()),
    forwardedAt: v.optional(v.number()),
    forwardedStatus: v.optional(v.number()),
    forwardedError: v.optional(v.string()),
  })
    .index("by_endpoint_time", ["endpointId", "receivedAt"])
    .index("by_user_time", ["userId", "receivedAt"]),
});
