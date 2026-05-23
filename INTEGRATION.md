# LocalLens Integration Checklist

## Product
LocalLens is an autonomous civic change monitor.

It watches messy public local sources, detects meaningful resident-relevant changes, publishes short cited briefs, and shows the agent trace behind every published update.

## Sponsor roles

### Nimble
Goal: real civic web extraction.

Needed from sponsor:
- API endpoint for Web Search Agent or extraction agent
- API key
- expected request body
- expected response shape

Env:
- NIMBLE_API_URL
- NIMBLE_API_KEY

Where used:
- lib/sponsors/nimble-civic.ts

What it should do:
- discover official/public sources for New Brunswick
- extract structured updates from city notices, transit alerts, agendas, parking pages, event calendars, permits
- return sources + changes as structured JSON

### ClickHouse
Goal: source/event/change ledger.

Env:
- CLICKHOUSE_URL
- CLICKHOUSE_USERNAME
- CLICKHOUSE_PASSWORD
- CLICKHOUSE_DATABASE

Where used:
- lib/clickhouse.ts

What it logs:
- source scan events
- extraction events
- editorial decisions
- rejected updates
- publish events
- metrics

### Senso / cited.md
Goal: publish grounded civic micro-briefs.

Env:
- SENSO_PUBLISH_URL or CITED_API_URL
- SENSO_API_KEY or CITED_API_KEY

Where used:
- lib/sponsors/senso-civic.ts

What it should do:
- publish the final brief
- preserve sources
- preserve agent trace
- return a public URL or citation ID

### Google Agents CLI / ADK
Goal: package LocalLens as an agent lifecycle project.

Suggested agent tools:
- nimble_civic_scan
- clickhouse_log_event
- senso_publish_brief
- editorial_decision

Suggested evals:
- rejects routine administrative update
- rejects unsupported claims
- publishes transportation update with official source
- includes agent trace
- avoids crime/private-person/rumor claims

## Local dev

Install:
npm install

Run:
npm run dev

Build:
npm run build

## Demo flow

1. Open homepage.
2. Click "Run LocalLens scan."
3. Show metrics: sources checked, changes detected, briefs published, rejected items.
4. Show Today's briefing.
5. Show Published civic brief.
6. Show Agent console.
7. Show Sponsor stack proof.

## Pitch line

LocalLens uses Nimble to turn the messy civic web into structured signals, ClickHouse to remember what changed, and Senso/cited.md to publish grounded civic briefs with a trace residents can inspect.
