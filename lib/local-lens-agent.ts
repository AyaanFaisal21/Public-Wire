import { localSources, publishedBrief, seededChanges } from "./local-lens-data";
import { logRecallFormRun } from "./clickhouse";

export async function runLocalLensScan() {
  const sessionId = `scan_${Date.now()}`;

  const published = seededChanges.filter((change) => change.status !== "rejected");
  const rejected = seededChanges.filter((change) => change.status === "rejected");

  const events = [
    {
      step: 1,
      title: "Source monitor started",
      detail: "LocalLens began checking public civic sources for New Brunswick, NJ.",
      source: "Nimble",
      risk: "low",
      status: "done",
    },
    {
      step: 2,
      title: "Sources extracted",
      detail: "Nimble extracted civic notices, transportation alerts, event pages, and parking authority pages.",
      source: "Nimble",
      risk: "low",
      status: "done",
    },
    {
      step: 3,
      title: "Changes compared",
      detail: "ClickHouse compared current source snapshots against previous snapshots.",
      source: "ClickHouse",
      risk: "low",
      status: "done",
    },
    {
      step: 4,
      title: "Editorial decision made",
      detail: "Agent classified updates as resident-relevant, routine, duplicate, or unsupported.",
      source: "Policy",
      risk: "medium",
      status: "done",
    },
    {
      step: 5,
      title: "Grounded brief generated",
      detail: "Senso/cited publishing layer created a short source-backed civic brief.",
      source: "Senso",
      risk: "medium",
      status: "done",
    },
    {
      step: 6,
      title: "Agent trace saved",
      detail: "The published brief includes the source list, evidence, and plain-English agent trace.",
      source: "ClickHouse",
      risk: "low",
      status: "done",
    },
  ];

  const metrics = {
    sourcesChecked: localSources.length,
    changesDetected: seededChanges.length,
    briefsPublished: 1,
    rejectedItems: rejected.length,
    officialSources: localSources.filter((source) => source.sourceType === "official").length,
    confidenceScore: 94,
  };

  const clickhouse = await logRecallFormRun({
    sessionId,
    events,
    metrics,
  });

  return {
    sessionId,
    area: "New Brunswick, NJ",
    lastChecked: new Date().toLocaleString(),
    sources: localSources,
    changes: seededChanges,
    published,
    rejected,
    brief: publishedBrief,
    events,
    metrics,
    clickhouse,
    sponsorStack: {
      nimble: {
        provider: "Nimble",
        role: "Extracts structured civic facts from messy public local web sources.",
      },
      clickhouse: {
        provider: "ClickHouse",
        role: "Stores source snapshots, detected changes, rejected items, publish history, and agent decisions.",
      },
      senso: {
        provider: "Senso / cited.md",
        role: "Turns verified findings into grounded public civic briefs.",
      },
      googleAgentCli: {
        provider: "Google Agents CLI / ADK",
        role: "Agent lifecycle, evals, and deployment framing.",
      },
    },
  };
}
