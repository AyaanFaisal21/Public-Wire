const STACK = [
  {
    name: "Nimble",
    role: "Live civic web access",
    body: "Searches, opens, and extracts structured facts from messy public sources — city sites, county notices, agendas, PDFs, calendars, alerts.",
  },
  {
    name: "ClickHouse",
    role: "Civic memory",
    body: "Stores source snapshots, content hashes, detected changes, agent decisions, publish history, and source health over time.",
  },
  {
    name: "Senso / cited.md",
    role: "Public publishing",
    body: "Turns approved briefs into grounded, citeable public artifacts — readable for humans and discoverable for other agents.",
  },
  {
    name: "Datadog",
    role: "Observability",
    body: "Traces every source fetch, extraction, decision, verification, review, and publication. Powers the public audit log.",
  },
];

export function Stack() {
  return (
    <section className="relative border-t border-border bg-card/40 paper-grain">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">§ 05</span>
          <span className="rule flex-1 max-w-[180px]" />
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">The stack</span>
        </div>

        <h2 className="font-display text-4xl lg:text-6xl leading-[0.95] tracking-tight mb-4 max-w-3xl">
          Four primitives.<br />
          <span className="italic text-muted-foreground">One newsroom.</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-16">
          The desk is built on a small stack of sponsor primitives, each handling
          a discrete job in the workflow.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border ink-shadow">
          {STACK.map((s) => (
            <div key={s.name} className="bg-background p-6 lg:p-8 min-h-[220px]">
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {s.role}
              </div>
              <h3 className="font-display text-3xl mb-3">{s.name}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
