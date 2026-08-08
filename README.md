# Hookline

**Webhook inspection & automation for developers.**

Hookline gives you a private endpoint that captures every HTTP request your
integrations send — then streams it to a real-time dashboard where you can
inspect payloads, replay events, and forward them anywhere. Zero
infrastructure, zero servers, one URL.

## Features

- **Capture everything** — GET/POST/PUT/PATCH/DELETE with full headers, query
  strings, and payloads up to 250 KB.
- **Live event feed** — events appear the instant they arrive; search, filter,
  and drill into any request.
- **Replay & forward** — resend any captured event to another URL, or enable
  auto-forwarding per endpoint.
- **Per-endpoint secrets** — unique, unguessable secret in every URL, rotatable
  at any time.
- **Stats** — daily volume, method breakdown, and last-24h activity rendered
  automatically.
- **Auth** — email + password accounts via Convex Auth.

## Stack

- [React](https://react.dev) + [Vite](https://vite.dev) + TypeScript
- [Convex](https://convex.dev) — database, queries/mutations/actions, and HTTP
  actions (the webhook capture endpoint)
- [Convex Auth](https://labs.convex.dev/auth) — password auth
- [Tailwind CSS v4](https://tailwindcss.com) + Framer Motion

## Getting started

```bash
bun install
bun convex dev --once   # generate types + run the local backend (port 3210)
bun dev                 # start the Vite dev server
```

The dev server picks up `VITE_CONVEX_URL` / `VITE_CONVEX_SITE_URL` from
`.env.local` (written by `convex dev`).

For production deploys, set those same variables as production env vars so the
frontend connects to the deployed Convex project.

## How it works

1. Sign in and create an endpoint — you get a URL like
   `https://<site>/hook/<secret>`.
2. Point any service (Stripe, GitHub, Slack, …) at that URL.
3. Watch events stream into the dashboard. Inspect the body/headers/query,
   replay a payload to another URL, or configure auto-forwarding.

## Project layout

```
convex.json            # Convex CLI config (functions live in src/convex)
src/convex/            # Backend: schema, auth, http routes, queries, mutations
src/pages/             # Landing, Auth, Dashboard
src/components/        # UI kit + hookline dashboard components
src/lib/utils.ts       # formatting helpers
```

## Deploying

The frontend is a static Vite build (`bun run build` produces `dist/`).
Production hosting needs two env vars **at build time**, pointing at a Convex
**cloud** deployment (the local dev backend at `127.0.0.1` cannot serve
production traffic):

1. Link this project to Convex cloud and push the backend:

   ```bash
   npx convex login      # interactive, one-time
   npx convex deploy     # pushes src/convex functions + schema
   ```

2. Set these production env vars to the URLs Convex prints (also in the
   Convex dashboard):

   ```
   VITE_CONVEX_URL=https://<project>.convex.cloud
   VITE_CONVEX_SITE_URL=https://<project>.convex.site
   ```

   `VITE_CONVEX_SITE_URL` is the base of the webhook capture endpoint
   (`/hook/<secret>`), so it must point at the deployed project.

3. Deploy the static site from the Freebuff Deploy button. If the env vars are
   missing, the app shows a clear “not connected” screen instead of failing
   silently.

## License

MIT
