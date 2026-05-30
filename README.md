# PublicWire

An autonomous civic newsroom. Agents discover public sources, extract resident-relevant updates, make an editorial publish/hold/reject decision, ground each surviving claim against organizational context, and persist the full audit trail to a time-series ledger. Every published brief ships with the trace that produced it.

Built with Next.js 16 (App Router), React 19, and TypeScript 5.

---

## What it does

Given a town slug or a reader-submitted topic, PublicWire runs a 5-stage pipeline:

1. **Discover** public civic sources (municipal notices, agendas, transit alerts, school notices, public events).
2. **Extract** structured civic updates from the raw source content.
3. **Decide** whether each candidate is publishable, routine, unsupported, or urgent.
4. **Ground** the surviving brief against organizational context for a citation receipt.
5. **Audit** the full agent chain and emit a reader-facing reliability review.

Every step is wrapped in an observability span. The public-facing "Investigate" view on each brief is the translated trace of those spans, color-coded by status.

---

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, Radix UI primitives, shadcn-style components |
| Motion | Framer Motion 12, Lenis (smooth scroll) |
| LLM | Google Gemini 2.5-flash (`@google/genai`) |
| Civic data | Nimble Search API (`@nimble-way/nimble-js`) |
| Storage | ClickHouse (MergeTree, self-bootstrapping schema) |
| Grounding | Senso / cited.md (`/org/search`) |
| Observability | Datadog APM (`dd-trace`) |
| Validation | Zod 4 |

---

## Routes

### Pages

| Path | Purpose |
|---|---|
| `/` | Landing — scroll-driven editorial homepage |
| `/local/[area]` | Live civic edition for any town slug |
| `/briefs/[id]` | Per-brief detail with full trust layer and investigation trace |

### API

| Method · Path | Auth | Purpose |
|---|---|---|
| `POST /api/public-wire/edition` | public, 12 req/min/IP | Run the full pipeline for `{area, slug, focus?, requestedTopic?}` |
| `POST /api/public-wire/coverage-request` | public | Reader-demand intake (weighted 3-request threshold) |
| `POST /api/public-wire/scan` | admin header secret | Operator-facing direct scan |
| `GET /api/sponsor-status` | public | Integration health check |

---

## Quick start

```bash
git clone https://github.com/AyaanFaisal21/Public-Wire.git
cd Public-Wire
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With no environment configured, the homepage and the canonical New Brunswick edition render against seeded fallback data. Any other town slug returns honest-empty results until live keys are provided.

---

## Environment

All integrations are optional — each one degrades to a typed fallback rather than throwing.

```bash
# LLM
GEMINI_API_KEY=

# Civic source discovery
NIMBLE_API_KEY=

# Time-series ledger
CLICKHOUSE_URL=
CLICKHOUSE_USERNAME=
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default

# Grounding / publishing
SENSO_API_KEY=
SENSO_SEARCH_URL=                  # optional override

# Observability
DD_TRACE_AGENT_URL=
DATADOG_LAPDOG_URL=                # optional forwarder

# Admin scan secret (fail-closed)
PUBLIC_WIRE_ADMIN_SECRET=

# Public URL resolution for citation links
NEXT_PUBLIC_APP_URL=
```

Missing keys produce a `seeded-demo` mode. Failed calls produce `api-error-fallback`. Successful calls produce `real-api`. The data envelope shape is identical in all three modes, so downstream code never branches on credential availability.

---

## Layout

```
app/
  api/
    public-wire/
      edition/          # public pipeline endpoint
      coverage-request/ # reader demand intake
      scan/             # admin-only direct scan
    sponsor-status/     # integration health
  local/[area]/         # edition page
  briefs/[id]/          # brief detail page
  page.tsx              # landing

components/
  landing/              # scroll-driven landing sections
  edition/              # the live edition view
  ui/                   # shadcn-style primitives

lib/
  public-wire-agent.ts            # 5-stage orchestrator
  public-wire-edition-adapter.ts  # backend → frontend shape adapter
  public-wire-data.ts             # seeded fallback + canonical types
  public-wire-request-guard.ts    # rate limit + admin guard
  clickhouse.ts                   # MergeTree ledger
  datadog-trace.ts                # span wrapper
  sponsors/
    nimble-civic.ts               # Nimble + Gemini extraction cascade
    google-editor.ts              # Gemini editorial decision
    senso-civic.ts                # Senso grounding
    lapdog-review.ts              # reliability audit

content/
  public-wire-content.ts          # frontend content schema + demo editions
```

---

## Build

```bash
npm run build
npm start
```

Deploys to Vercel out of the box. `VERCEL_URL` is read automatically when constructing citation links.

---

## License

Private project. All rights reserved.
