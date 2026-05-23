"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

type ScanResult = {
  sessionId: string;
  area: string;
  lastChecked: string;
  sources: Array<{
    id: string;
    name: string;
    url: string;
    category: string;
    sourceType: string;
  }>;
  changes: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    importance: string;
    whatChanged: string;
    whyItMatters: string;
    whoIsAffected: string[];
    evidence: string[];
    rejectionReason?: string;
  }>;
  published: ScanResult["changes"];
  rejected: ScanResult["changes"];
  brief: {
    id: string;
    headline: string;
    area: string;
    category: string;
    confidence: string;
    status: string;
    summary: string;
    whyItMatters: string;
    whoIsAffected: string[];
    sources: { title: string; url: string; role: string }[];
    agentTrace: string[];
  };
  events: Array<{
    step: number;
    title: string;
    detail: string;
    source: string;
    risk: string;
    status: string;
  }>;
  metrics: Record<string, number>;
  clickhouse: { enabled: boolean; message?: string; reason?: string };
  publishing?: {
    provider: string;
    mode: string;
    purpose: string;
    publishedUrl?: string;
    citationId?: string;
  };
  sponsorStack: Record<string, { provider: string; role: string }>;
};

type Props = {
  areaSlug: string;
  areaName: string;
  focus: string[];
};

function readableKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function LocalEdition({ areaSlug, areaName, focus }: Props) {
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/local-lens/scan", { method: "POST" });
      if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const json = (await res.json()) as ScanResult;
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="paper-grain">
      {/* Edition masthead */}
      <section className="relative border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-14 pb-10">
          <div className="flex items-baseline gap-3 mb-6 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span>LocalLens {areaName}</span>
            <span className="rule flex-1 max-w-[200px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-display text-5xl lg:text-7xl leading-[0.95] tracking-tight mb-3">
            Today&apos;s Civic Briefing
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {data ? (
              <>Last checked {data.lastChecked} · {data.sources.length} sources monitored · {data.published.length} meaningful updates · {data.rejected.length} routine items filtered.</>
            ) : (
              <>The desk is opening this edition…</>
            )}
          </p>

          {focus.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Focused on:
              </span>
              {focus.map((f) => (
                <span
                  key={f}
                  className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border"
                >
                  {f.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Button
              onClick={load}
              disabled={loading}
              className="rounded-full bg-foreground hover:bg-foreground/90 text-background"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Running desk…
                </>
              ) : (
                <>
                  <RefreshCcw className="size-4" /> Run another scan
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          <div className="border border-destructive/40 bg-destructive/5 text-destructive p-4 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}

      {!data && loading && (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 text-center">
          <Loader2 className="size-6 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-[0.18em]">
            Civic agents are scanning {areaName}…
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Metrics strip */}
          <section className="border-b border-border bg-card/40">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
              {Object.entries(data.metrics).map(([k, v]) => (
                <div key={k} className="bg-card p-4">
                  <div className="font-display text-3xl">{v}</div>
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground mt-1">
                    {readableKey(k)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top story */}
          <section className="border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Top story
                </span>
                <span className="rule flex-1 max-w-[200px]" />
              </div>

              <div className="grid lg:grid-cols-[1.4fr_1fr] gap-px bg-border ink-shadow">
                <article className="bg-background p-8 lg:p-12">
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-foreground/60 bg-foreground text-background">
                      {data.brief.confidence} confidence
                    </span>
                    <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border">
                      {data.brief.category}
                    </span>
                    <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border">
                      {data.brief.status}
                    </span>
                  </div>

                  <h2 className="font-display text-3xl lg:text-5xl leading-[1.02] tracking-tight mb-6">
                    {data.brief.headline}
                  </h2>

                  <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                    {data.brief.summary}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="border-t border-border pt-3">
                      <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                        Why it matters
                      </div>
                      <p className="text-sm text-foreground/80">{data.brief.whyItMatters}</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                        Who is affected
                      </div>
                      <p className="text-sm text-foreground/80">
                        {data.brief.whoIsAffected.join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                      Sources used
                    </div>
                    <div className="space-y-3">
                      {data.brief.sources.map((s) => (
                        <div key={s.title} className="flex flex-col">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium hover:underline"
                          >
                            {s.title}
                          </a>
                          <span className="text-xs text-muted-foreground">{s.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>

                <aside className="bg-card p-8 lg:p-10">
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground mb-4">
                    Agent audit log
                  </div>
                  <ol className="space-y-3">
                    {data.brief.agentTrace.map((line, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                        <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>

                  {data.publishing && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                        Published artifact
                      </div>
                      <p className="text-sm text-foreground/85 mb-2">
                        {data.publishing.provider} · <span className="font-mono text-xs">{data.publishing.mode}</span>
                      </p>
                      {data.publishing.publishedUrl && (
                        <a
                          href={data.publishing.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline text-muted-foreground hover:text-foreground"
                        >
                          {data.publishing.publishedUrl}
                        </a>
                      )}
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>

          {/* Other updates + rejected */}
          <section className="border-b border-border bg-card/40">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14 grid lg:grid-cols-[1.3fr_1fr] gap-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Also today
                  </span>
                  <span className="rule flex-1 max-w-[200px]" />
                </div>
                <div className="space-y-4">
                  {data.published.map((change) => (
                    <article
                      key={change.id}
                      className="bg-background border border-border p-5 ink-shadow"
                    >
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[0.6rem] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border border-border">
                          {change.category}
                        </span>
                        <span className="text-[0.6rem] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border border-border">
                          {change.importance}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl leading-tight mb-2">{change.title}</h3>
                      <p className="text-sm text-foreground/75 mb-1">
                        <strong>What changed: </strong>{change.whatChanged}
                      </p>
                      <p className="text-sm text-foreground/75">
                        <strong>Why it matters: </strong>{change.whyItMatters}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Rejected
                  </span>
                  <span className="rule flex-1 max-w-[120px]" />
                </div>
                <div className="space-y-3">
                  {data.rejected.map((change) => (
                    <div
                      key={change.id}
                      className="bg-background border border-border p-4 ink-shadow"
                    >
                      <div className="text-sm font-medium mb-1">{change.title}</div>
                      <p className="text-xs text-muted-foreground">
                        {change.rejectionReason}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          {/* Agent console */}
          <section className="border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Agent console
                </span>
                <span className="rule flex-1 max-w-[200px]" />
              </div>
              <p className="text-muted-foreground max-w-2xl mb-8">
                What the autonomous desk checked, decided, rejected, and published — step by step.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border ink-shadow">
                {data.events.map((event) => (
                  <div key={event.step} className="bg-background p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background font-mono text-xs">
                        {event.step}
                      </span>
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {event.source}
                      </span>
                    </div>
                    <h3 className="font-display text-xl mb-2">{event.title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{event.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sources monitored + stack */}
          <section className="border-b border-border bg-card/40">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14 grid lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Sources monitored
                  </span>
                  <span className="rule flex-1 max-w-[120px]" />
                </div>
                <div className="space-y-3">
                  {data.sources.map((s) => (
                    <div key={s.id} className="bg-background border border-border p-4 ink-shadow">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[0.65rem] font-mono uppercase tracking-[0.15em] text-muted-foreground mt-1">
                        {s.category} · {s.sourceType}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">{s.url}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Sponsor stack
                  </span>
                  <span className="rule flex-1 max-w-[120px]" />
                </div>
                <div className="grid gap-3">
                  {Object.values(data.sponsorStack).map((sp) => (
                    <div
                      key={sp.provider}
                      className="bg-background border border-border p-4 ink-shadow"
                    >
                      <div className="font-display text-xl mb-1">{sp.provider}</div>
                      <p className="text-sm text-muted-foreground">{sp.role}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-background border border-border p-4 ink-shadow">
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    ClickHouse ledger
                  </div>
                  <p className="text-sm text-foreground/80">
                    {data.clickhouse.message || data.clickhouse.reason}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
              End of edition · {areaName} · Session {data.sessionId}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
