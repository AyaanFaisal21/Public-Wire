import type { LocalChange, LocalSource } from "@/lib/local-lens-data";

type NimbleCivicResult = {
  provider: "Nimble";
  mode: "real-api" | "seeded-demo" | "api-error-fallback";
  purpose: string;
  sources: LocalSource[];
  changes: LocalChange[];
  raw?: unknown;
  error?: string;
};

function normalizeRawCivicResult(raw: unknown, fallbackSources: LocalSource[], fallbackChanges: LocalChange[]) {
  if (!raw || typeof raw !== "object") {
    return { sources: fallbackSources, changes: fallbackChanges };
  }

  const obj = raw as {
    sources?: LocalSource[];
    changes?: LocalChange[];
    results?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>>;
  };

  const sources = Array.isArray(obj.sources) && obj.sources.length
    ? obj.sources
    : fallbackSources;

  if (Array.isArray(obj.changes) && obj.changes.length) {
    return { sources, changes: obj.changes };
  }

  const rows = Array.isArray(obj.results)
    ? obj.results
    : Array.isArray(obj.data)
      ? obj.data
      : [];

  if (!rows.length) return { sources, changes: fallbackChanges };

  const changes: LocalChange[] = rows.slice(0, 6).map((row, index) => ({
    id: String(row.id || `live_change_${index + 1}`),
    sourceId: String(row.sourceId || row.source_id || "live_source"),
    title: String(row.title || row.headline || `Civic update ${index + 1}`),
    category: "transportation",
    status: "new",
    importance: "resident-relevant",
    whatChanged: String(row.whatChanged || row.what_changed || row.description || row.text || "A public local source changed."),
    whyItMatters: String(row.whyItMatters || row.why_it_matters || "This may affect residents nearby."),
    whoIsAffected: Array.isArray(row.whoIsAffected)
      ? row.whoIsAffected.map(String)
      : ["residents"],
    evidence: Array.isArray(row.evidence)
      ? row.evidence.map(String)
      : [String(row.url || row.source || "Nimble live web source")],
  }));

  return { sources, changes };
}

export async function nimbleRunCivicScan(params: {
  area: string;
  fallbackSources: LocalSource[];
  fallbackChanges: LocalChange[];
}): Promise<NimbleCivicResult> {
  const apiUrl = process.env.NIMBLE_API_URL;
  const apiKey = process.env.NIMBLE_API_KEY;

  if (!apiUrl || !apiKey) {
    return {
      provider: "Nimble",
      mode: "seeded-demo",
      purpose:
        "Civic web source discovery and structured extraction. Add NIMBLE_API_URL and NIMBLE_API_KEY to enable real web scanning.",
      sources: params.fallbackSources,
      changes: params.fallbackChanges,
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        task:
          `For ${params.area}, find official/public civic sources and extract recent resident-relevant changes. ` +
          "Prioritize city notices, construction, public works, transit alerts, parking, school board updates, permits, and event calendars. " +
          "Return structured sources and changes. Exclude rumors, private-person claims, unsupported crime claims, and opinion.",
        area: params.area,
        output_schema: {
          sources: [
            {
              id: "string",
              name: "string",
              url: "string",
              category: "city | transportation | school | event | permit | rutgers",
              sourceType: "official | public"
            }
          ],
          changes: [
            {
              id: "string",
              sourceId: "string",
              title: "string",
              category: "transportation | city-agenda | event | school | construction",
              status: "new | updated | rejected",
              importance: "urgent | resident-relevant | routine | unsupported",
              whatChanged: "string",
              whyItMatters: "string",
              whoIsAffected: ["string"],
              evidence: ["string"]
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Nimble API returned ${response.status}: ${await response.text()}`);
    }

    const raw = await response.json();
    const normalized = normalizeRawCivicResult(raw, params.fallbackSources, params.fallbackChanges);

    return {
      provider: "Nimble",
      mode: "real-api",
      purpose:
        "Real live-web civic source discovery and structured update extraction using Nimble.",
      sources: normalized.sources,
      changes: normalized.changes,
      raw,
    };
  } catch (error) {
    return {
      provider: "Nimble",
      mode: "api-error-fallback",
      purpose:
        "Nimble civic scan failed, so LocalLens fell back to seeded civic source data for demo continuity.",
      sources: params.fallbackSources,
      changes: params.fallbackChanges,
      error: String(error),
    };
  }
}
