import type { CivicBrief } from "@/lib/local-lens-data";

type SensoPublishResult = {
  provider: "Senso / cited.md";
  mode: "real-api" | "seeded-demo" | "api-error-fallback";
  purpose: string;
  publishedUrl?: string;
  citationId?: string;
  raw?: unknown;
  error?: string;
};

export async function publishCivicBrief(params: {
  brief: CivicBrief;
}): Promise<SensoPublishResult> {
  const apiUrl = process.env.SENSO_PUBLISH_URL || process.env.CITED_API_URL;
  const apiKey = process.env.SENSO_API_KEY || process.env.CITED_API_KEY;

  if (!apiUrl || !apiKey) {
    return {
      provider: "Senso / cited.md",
      mode: "seeded-demo",
      purpose:
        "Grounded public civic brief publishing. Add SENSO_PUBLISH_URL/SENSO_API_KEY or CITED_API_URL/CITED_API_KEY to enable real publishing.",
      publishedUrl: `/briefs/${params.brief.id}`,
      citationId: `seeded_${params.brief.id}`,
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
        title: params.brief.headline,
        area: params.brief.area,
        category: params.brief.category,
        status: params.brief.status,
        confidence: params.brief.confidence,
        summary: params.brief.summary,
        why_it_matters: params.brief.whyItMatters,
        who_is_affected: params.brief.whoIsAffected,
        sources: params.brief.sources,
        agent_trace: params.brief.agentTrace,
        output_type: "grounded_civic_microbrief",
      }),
    });

    if (!response.ok) {
      throw new Error(`Senso/cited publish returned ${response.status}: ${await response.text()}`);
    }

    const raw = await response.json() as {
      url?: string;
      published_url?: string;
      id?: string;
      citation_id?: string;
    };

    return {
      provider: "Senso / cited.md",
      mode: "real-api",
      purpose: "Published a grounded civic micro-brief with sources and agent trace.",
      publishedUrl: raw.published_url || raw.url,
      citationId: raw.citation_id || raw.id,
      raw,
    };
  } catch (error) {
    return {
      provider: "Senso / cited.md",
      mode: "api-error-fallback",
      purpose:
        "Publishing failed, so LocalLens kept the brief as a local seeded public artifact for demo continuity.",
      publishedUrl: `/briefs/${params.brief.id}`,
      citationId: `fallback_${params.brief.id}`,
      error: String(error),
    };
  }
}
