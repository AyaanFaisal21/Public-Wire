const FIELDS = [
  { label: "Headline", value: "George Street construction may affect downtown traffic this weekend" },
  { label: "Confidence", value: "High — official city source" },
  { label: "What changed", value: "New construction notice posted, affecting traffic Sat AM – Sun PM" },
  { label: "Who is affected", value: "Downtown residents, Rutgers students, bus riders, local businesses" },
  { label: "Sources checked", value: "12 (10 reachable, 2 stale)" },
  { label: "Sources used", value: "City construction notice · NJ Transit advisory" },
];

const AUDIT_LINES = [
  "Checked 12 public sources around New Brunswick.",
  "Detected 3 meaningful changes since the previous snapshot.",
  "Rejected 5 routine administrative updates.",
  "Verified street, dates, and affected groups against official source.",
  "Classified resident-relevant — affects downtown transportation.",
  "Mentor approved. No unsupported claims. No speculation.",
  "Published a cited micro-brief and added trace.",
];

export function TrustLayer() {
  return (
    <section id="trust" className="relative border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">§ 04</span>
          <span className="rule flex-1 max-w-[180px]" />
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">Trust layer</span>
        </div>

        <h2 className="font-display text-4xl lg:text-6xl leading-[0.95] tracking-tight mb-4 max-w-3xl">
          Every brief shows<br />its receipts.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-16">
          Each entry is shipped with the sources it used, what was rejected, what the
          mentor agent said, and a plain-English trace of how the story was made.
        </p>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-px bg-border ink-shadow">
          {/* Brief card */}
          <article className="bg-background p-8 lg:p-10">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-foreground/60 bg-foreground text-background">
                High confidence
              </span>
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border">
                Transportation
              </span>
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border">
                Active
              </span>
            </div>
            <h3 className="font-display text-3xl lg:text-4xl leading-tight mb-6">
              George Street construction may affect downtown traffic this weekend.
            </h3>
            <dl className="space-y-4">
              {FIELDS.map((f) => (
                <div key={f.label} className="grid grid-cols-[140px_1fr] gap-4 items-baseline border-t border-border/60 pt-3">
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="text-sm text-foreground/85 leading-relaxed">{f.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          {/* Audit log */}
          <aside className="bg-card p-8 lg:p-10">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground mb-4">
              Public audit log
            </div>
            <ol className="space-y-3">
              {AUDIT_LINES.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Mentor review
              </div>
              <p className="text-sm text-foreground/85 italic leading-relaxed">
                &ldquo;Approved. The entry uses an official city source, does not
                speculate beyond the notice, labels affected groups clearly, and
                avoids unsupported claims about delays.&rdquo;
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
