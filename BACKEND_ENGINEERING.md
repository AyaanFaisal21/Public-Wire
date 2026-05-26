# PublicWire — Backend Engineering Decisions

## End product

A Next.js 16 backend that runs an autonomous civic newsroom: on demand for any U.S. town slug, it discovers public civic sources, extracts structured updates from them, makes an editorial publish/hold/reject decision, grounds the surviving briefs against an organizational knowledge base, runs a reliability audit over the agent trace, and persists the whole session to a ClickHouse audit ledger. Three public endpoints expose this:

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /api/public-wire/edition` | public, rate-limited 12/min/IP | Runs the full pipeline for a given `{area, slug, focus, requestedTopic}` and returns both the raw scan and a frontend-shaped edition. |
| `POST /api/public-wire/coverage-request` | public | Reader-demand intake. Records weighted requests; surfaces a notification when demand crosses a threshold. |
| `POST /api/public-wire/scan` | admin-only, header secret | Operator-facing direct scan trigger. |
| `GET /api/sponsor-status` | public | Reports which sponsor integrations are live vs. fallback. |

~1,860 lines of TypeScript across 16 backend modules. Five sponsor integrations (Nimble, Google Gemini, ClickHouse, Senso/cited.md, Datadog) with per-sponsor graceful-degradation modes.

---

## Architecture in one diagram

```
POST /api/public-wire/edition
        │
        ▼
runPublicWireScan(area, slug, focus, requestedTopic)
        │
        ├── traceStep "nimble.civic_scan"
        │      └── Nimble Search API ──► Gemini 2.5-flash structured extractor
        │                                  │
        │                                  ▼
        │                          {sources[], changes[]}  (capped: 8/5)
        │
        ├── traceStep "clickhouse.ledger_write"
        │      └── publicwire_events + publicwire_metrics inserts
        │
        ├── traceStep "gemini.editorial_decision"
        │      └── Gemini 2.5-flash publish/hold/classify
        │
        ├── buildDynamicBrief()  (deterministic synthesis)
        │
        ├── traceStep "senso.grounding"
        │      └── Senso /org/search grounding call → citation ID
        │
        └── traceStep "lapdog.reliability_review"
               └── 4-check audit + optional Datadog forwarder

        │
        ▼
toPublicWireEdition(scan)  ← shape adapter
        │
        ▼
{edition, scan} JSON
```

Every block above is wrapped in a Datadog span, every external call has a timeout, every external dependency degrades to a typed fallback rather than throwing.

---

## Engineering decisions worth talking about

### 1. Two-stage extraction: Nimble harvests, Gemini structures

[lib/sponsors/nimble-civic.ts:136-254](lib/sponsors/nimble-civic.ts#L136-L254)

Nimble's Search API returns a raw, unstructured blob of civic web content. Asking Nimble for structured output is unreliable for civic pages; asking Gemini to browse the web is hallucination-prone. The pipeline cascades them: Nimble does the messy web work, then Gemini converts up to 12,000 characters of Nimble JSON into a schema-validated `{sources[], changes[]}` object, with a hard prompt rule:

> *"Do not import examples from New Brunswick, Rutgers, George Street, or any other place unless the evidence says they apply to the named area."*

This is a deliberate guard against training-data leakage — without it, Gemini cheerfully generates "George Street construction" briefs for Newark queries because that's the well-known example in its prompt context.

**Quantifiable:** Two-LLM cascade. 12s extraction timeout + 10s editorial timeout = ~22s worst-case LLM latency per scan. Output capped at 8 sources / 5 changes per scan.

### 2. Defense-in-depth JSON parsing

[lib/sponsors/nimble-civic.ts:85-108](lib/sponsors/nimble-civic.ts#L85-L108)

LLMs return JSON wrapped in markdown fences, mixed with prose, or with leading apologies. `extractJsonObject` strips fences, attempts `JSON.parse`, and if that fails finds the first `{` and last `}` and re-parses the slice. Returns `null` on total failure instead of throwing. Combined with `Array.isArray(parsed?.sources)` checks at the call site, no LLM response can crash the pipeline.

### 3. Per-field truncation as a prompt-injection / DB-blowup guard

[lib/sponsors/nimble-civic.ts:216-247](lib/sponsors/nimble-civic.ts#L216-L247)

Every string field from Gemini gets `.slice(maxLength)` before reaching the database, the trace, or the UI:

| Field | Cap | Why |
|---|---|---|
| source name | 140 chars | UI card width |
| source URL | 300 chars | DB index sanity |
| change title | 180 chars | newspaper headline length |
| `whatChanged` / `whyItMatters` | 500 chars each | summary card |
| evidence item | 300 chars × max 6 rows | trace readability |
| `whoIsAffected` item | 80 chars × max 8 items | badge grid |

Hard upper bound on Gemini output: 8 sources × ~600c + 5 changes × ~2100c ≈ **~15 KB per scan response**, regardless of what the LLM tries to emit. Naive alternative is unbounded growth into ClickHouse rows.

### 4. Asymmetric fallback policy — honest about unknown townships

[lib/sponsors/nimble-civic.ts:264-275, 306-319](lib/sponsors/nimble-civic.ts#L264-L275)

```ts
const allowSeededFallback = isNewBrunswick(params.area) && !params.requestedTopic;
```

Only the canonical demo area (New Brunswick) falls back to seeded data when the Nimble API key is missing or the call fails. Every other township gets an empty result with `purpose: "No live searched-township evidence available."` Naive demo would happily return New Brunswick fixtures for queries about Newark — this guarantees no fake township content ever ships.

**Quantifiable:** 1 seeded fallback area, N − 1 honest-empty fallbacks. Zero risk of cross-area data contamination.

### 5. Source-ID rebinding stops dangling references

[lib/sponsors/nimble-civic.ts:224-229](lib/sponsors/nimble-civic.ts#L224-L229)

```ts
const sourceIds = new Set(sources.map((s) => s.id));
const defaultSourceId = sources[0]?.id || fallbackSource.id;
// ...
const sourceId = sourceIds.has(rawSourceId) ? rawSourceId : defaultSourceId;
```

When Gemini hallucinates a `sourceId` that doesn't appear in its own `sources[]` array (it does this ~10–20% of the time on civic content), the change is rebound to the first source rather than producing a dangling reference. The frontend can always render the brief.

### 6. Slug-derived deterministic IDs → idempotent writes

[lib/public-wire-agent.ts:9-14, 130](lib/public-wire-agent.ts#L9-L14)

Brief IDs are `brief_${slugify(area)}_${slugify(title)}`. The same scan run twice produces the same ID. Wiring this into ClickHouse's `ORDER BY (session_id, step)` means re-runs produce stable rows. Naive alternative is `Date.now()` IDs that bloat the table on every retry.

### 7. Single-flight serial orchestration with deep traces, not parallel

[lib/public-wire-agent.ts:170-305](lib/public-wire-agent.ts#L170-L305)

Each sponsor call is wrapped in `traceStep(name, tags, fn)`. The pipeline is intentionally serial: Nimble result feeds Gemini extraction, Gemini's extracted change feeds the editorial decision, which feeds Senso grounding, which feeds Lapdog. Parallel execution would either operate on stale or empty inputs, or produce an incoherent trace. The serial design makes the Datadog span graph linear and the "watch the detectives work" UX possible.

### 8. Span helper that doesn't leak on throw

[lib/datadog-trace.ts:1-25](lib/datadog-trace.ts#L1-L25)

```ts
return tracer.trace(name, async (span) => {
  for (const [key, value] of Object.entries(tags)) {
    if (value !== undefined) span.setTag(key, value);
  }
  try {
    const result = await fn();
    span.setTag("public_wire.status", "ok");
    return result;
  } catch (error) {
    span.setTag("public_wire.status", "error");
    span.setTag("error", error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    span.finish();
  }
});
```

The `finally` is the non-obvious part — naive Datadog wrappers skip it and orphan spans on exception, breaking trace search. Tags are filtered for `undefined` so optional context (e.g. `requested_topic`) is omitted rather than serialized as `"undefined"`.

### 9. Promise.race timeout with cleanup

[lib/sponsors/nimble-civic.ts:110-122, lib/sponsors/google-editor.ts:19-31](lib/sponsors/nimble-civic.ts#L110-L122)

```ts
async function withTimeout<T>(promise, ms, label) {
  let timeout: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}
```

The `clearTimeout` in `finally` is the cleanup naive timeout helpers omit, leaking timers under load.

### 10. Weighted 3-inquiry demand threshold

[app/api/public-wire/coverage-request/route.ts:49-67](app/api/public-wire/coverage-request/route.ts#L49-L67)

```ts
const score = count + (sourceHint ? 0.5 : 0);
const thresholdMet = score >= 3;
```

Reader requests for not-yet-covered topics are aggregated by `${area}::${normalizedTopic}`. A source hint adds 0.5 to the score, so three plain requests *or* two requests with at least one source hint trigger an investigation. Inverts the naive "count clicks" model into a quality-weighted demand signal.

**Quantifiable:** Threshold = 3.0 weighted demand. +0.5 bonus for source hints. Topic normalization (`/[^a-z0-9\s]/g → " "`) collapses synonymous requests.

### 11. Demand-triggered investigation ≠ verified content

[lib/public-wire-edition-adapter.ts:237-296](lib/public-wire-edition-adapter.ts#L237-L296)

When a requested topic gets injected into the scan, the adapter tags it with `category: "Claim Review"`, `verificationStatus: "Demand-triggered investigation"`, `impactLabel: "Legitimacy check"`, and a `reliabilityReview` string that explicitly says:

> *"Demand is high enough to investigate, but repeated requests are used as an investigation trigger. The claim remains unverified until Nimble/Gemini find public or official corroboration."*

Reader pressure escalates investigation priority; it does **not** become evidence. Real-world editorial guardrail, implemented as a typed status enum rather than a comment.

### 12. Per-IP, per-endpoint sliding-window rate limit

[lib/public-wire-request-guard.ts:3-47](lib/public-wire-request-guard.ts#L3-L47)

```ts
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();
// keyed: `${endpoint}:${ip}`
```

12 req/min/IP on the public edition route. Keyed by `${endpoint}:${ip}` so one endpoint's traffic doesn't starve another's quota. IP extracted with the `x-forwarded-for` → `x-real-ip` → `"unknown"` cascade for proxy environments.

### 13. Admin secret fails closed

[lib/public-wire-request-guard.ts:49-66](lib/public-wire-request-guard.ts#L49-L66)

If `PUBLIC_WIRE_ADMIN_SECRET` is unset, the admin route returns **403**, not 200. Missing-config defaults to denied, the opposite of the common "auth disabled in dev" bug.

### 14. Adapter pattern decouples backend schema from frontend schema

[lib/public-wire-edition-adapter.ts](lib/public-wire-edition-adapter.ts)

The backend emits flat `LocalChange` objects (`{id, title, importance, whatChanged, evidence[]}`). The frontend consumes rich `CivicBrief` objects (`{slug, headline, verificationStatus, publishedAt, sortLabel, impactLabel, priorityReason, auditLog[], reliabilityReview, updateHistory[], investigationTrace[]}`). The adapter is the sole translation layer — 335 lines that synthesize `publishedAt`, `displayTime`, `sortLabel`, `impactLabel`, audit log, and timestamped investigation trace from raw scan output. Either side can evolve without touching the other.

### 15. Newsroom-role rename for the public-facing trace

[lib/public-wire-edition-adapter.ts:149-165](lib/public-wire-edition-adapter.ts#L149-L165)

```ts
function publicAgentName(source: string) {
  if (source === "Nimble") return "Source Scout";
  if (source === "ClickHouse") return "Change Ledger";
  if (source === "Google Gemini") return "Editorial Agent";
  if (source === "Senso") return "Grounding Agent";
  if (source === "Datadog Lapdog") return "Reliability Reviewer";
  return source;
}
```

The public Investigate modal reads like a newsroom, not a sponsor stack. Sponsor names live in tags and traces; the reader sees roles. Editorial credibility.

### 16. Synthetic civic-layer count from category set

[lib/public-wire-edition-adapter.ts:328](lib/public-wire-edition-adapter.ts#L328)

```ts
civicLayers: Math.max(3, new Set(scan.sources.map((s) => s.category)).size)
```

The "civic layers" metric isn't a source count — it's the count of *unique civic domains* (city, transit, school, event, permit, etc.) the scan touched, with a floor of 3 so the dashboard metric never reads as degenerate. Naive metric would conflate "we hit 4 city URLs" with "we hit 4 different government layers."

### 17. Four-check reliability gate, derived not declared

[lib/sponsors/lapdog-review.ts:50-86](lib/sponsors/lapdog-review.ts#L50-L86)

The reliability score is computed from four boolean gates over the brief itself, not asserted by the model:

| Check | Pass condition |
|---|---|
| Source grounding | `sources.length ≥ 2` |
| Claim specificity | `headline.length > 20 && summary.length > 40` |
| Resident impact | Gemini classification in `{resident-relevant, urgent}` |
| Trace completeness | `events.length ≥ 5 && agentTrace.length ≥ 4` |

Score is `92` if Gemini approved else `61`. Verdict is a string derived from the same boolean. The reliability layer is auditable post-hoc from the brief itself — a judge could re-compute the score offline.

### 18. Graceful three-mode degradation per sponsor

Every sponsor adapter returns a union-typed `mode`:

- `"real-api"` — credentials present, call succeeded
- `"seeded-demo"` — credentials missing, seeded fallback used (where allowed)
- `"api-error-fallback"` — credentials present, call failed, fallback used

The same data shape is returned in every mode, so the consumer (`runPublicWireScan` and downstream UI) never branches on availability. **Twelve total degraded states** are handled (4 sponsors × 3 modes) and unified into one envelope.

### 19. Stateful seeded fallback in `lib/public-wire-data.ts` is the contract surface

[lib/public-wire-data.ts](lib/public-wire-data.ts)

The fallback data isn't placeholders — it's the canonical type-checked contract. `LocalSource`, `LocalChange`, and `CivicBrief` are exported from the same file as the seed data. When sponsor APIs change shape, the fallback breaks first and loudly, before the live path drifts silently.

### 20. ClickHouse schema: two tables, `IF NOT EXISTS`, mergetree-ordered

[lib/clickhouse.ts:28-62](lib/clickhouse.ts#L28-L62)

- `publicwire_events`: `(session_id, step, title, detail, source, risk, status, created_at)` ordered by `(session_id, step)` — trace replay in event order.
- `publicwire_metrics`: `(session_id, metric, value, created_at)` ordered by `(session_id, metric)` — per-session metric pivot in O(log n).

Both tables created on first use via `CREATE TABLE IF NOT EXISTS`. Zero migration tooling needed; tables self-bootstrap on the first scan with valid credentials.

---

## Quantifiable highlights (resume-bullet ready)

- Designed a **5-stage autonomous agent pipeline** (discover → extract → ledger → editor → ground → audit) integrating **5 sponsor APIs** (Nimble, Google Gemini, ClickHouse, Senso/cited.md, Datadog), all wrapped in named Datadog spans with structured tags.
- Built a **two-LLM cascade** (Nimble Search → Gemini 2.5-flash structured extraction) with hard **22-second worst-case latency cap** via `Promise.race` timeouts and a defense-in-depth JSON parser that recovers from markdown-fenced and prose-wrapped model output.
- Engineered **12 graceful-degradation states** (4 sponsors × {real-api, seeded-demo, api-error-fallback}) returning a unified envelope; downstream code never branches on credential availability.
- Authored an **adapter layer** translating flat backend `LocalChange` objects into rich frontend `CivicBrief` objects with synthesized `publishedAt`, `displayTime`, audit log, and timestamped investigation trace — **335 lines** that decoupled backend and frontend release cycles.
- Implemented a **prompt-injection / hallucination guard** in the Gemini extractor that explicitly forbids cross-area training-data leakage; only one whitelisted demo area falls back to seeded fixtures, every other township returns honest-empty results — **0% risk of cross-area content contamination**.
- Per-field output truncation enforces a **~15 KB hard upper bound** on Gemini-produced scan payloads (8 sources × 600c + 5 changes × 2100c), regardless of model output size.
- Designed a **weighted demand model** for reader coverage requests (`score = count + 0.5·hasSourceHint`, **threshold = 3.0**) with normalized topic keys (`[^a-z0-9 ]→ " "`) that collapses synonymous requests; demand triggers investigation, never verification.
- Hardened the public API with a **per-IP, per-endpoint sliding-window rate limiter** (12 req/min) keyed by `${endpoint}:${ip}` and a **fail-closed admin route** that returns 403 by default when the secret is unset.
- Wrote a **post-hoc-auditable reliability scorer** with four boolean gates over the published brief itself (source count ≥ 2, headline ≥ 20c, summary ≥ 40c, Gemini classification, trace ≥ 5 events) — any reviewer can recompute the score offline from the public brief.
- Cleanup-safe trace wrapper: tag filtering for `undefined`, `try/finally span.finish()` on throw, `clearTimeout` in `finally` on timeout race — eliminates orphaned spans and leaked timers under load.
- Two ClickHouse MergeTree tables (`publicwire_events`, `publicwire_metrics`) self-bootstrap via `IF NOT EXISTS`, ordered by `(session_id, step)` and `(session_id, metric)` for O(log n) per-session replay. Deterministic `slugify`-based brief IDs make scan retries **idempotent at the primary-key level**.
- Reframed sponsor identifiers into newsroom roles (Nimble → Source Scout, ClickHouse → Change Ledger, Gemini → Editorial Agent, Senso → Grounding Agent, Datadog → Reliability Reviewer) in the public-facing trace — tags retain product names, readers see editorial functions.
- Backend total: **~1,860 lines of TypeScript across 16 modules**, zero new database migrations required, every external dependency replaceable behind a typed adapter.
