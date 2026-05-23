const STEPS = [
  {
    n: "01",
    title: "Scout",
    body: "Agents discover and validate public sources for your area — city sites, county notices, transit alerts, agendas, school updates, event calendars, permits.",
    tool: "Nimble",
  },
  {
    n: "02",
    title: "Monitor",
    body: "The desk passively checks each source, pulls live content, parses messy PDFs and calendars, and watches for change.",
    tool: "Nimble",
  },
  {
    n: "03",
    title: "Remember",
    body: "Every snapshot, hash, and decision is written to a civic memory store. The desk knows what changed since last time and what was already published.",
    tool: "ClickHouse",
  },
  {
    n: "04",
    title: "Decide",
    body: "An editor agent filters out administrative noise. A verifier checks claims against source text. A mentor agent reviews the work before anything goes to press.",
    tool: "Editorial",
  },
  {
    n: "05",
    title: "Publish",
    body: "Approved briefs are published as grounded, citeable civic micro-briefs — readable for residents, machine-readable for other agents.",
    tool: "Senso / cited.md",
  },
  {
    n: "06",
    title: "Explain",
    body: "Every brief includes what was checked, what was rejected, what was approved, and why. Every span is traced. Trust is the artifact.",
    tool: "Datadog",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">§ 02</span>
          <span className="rule flex-1 max-w-[180px]" />
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">How it works</span>
        </div>

        <h2 className="font-display text-4xl lg:text-6xl leading-[0.95] tracking-tight mb-4 max-w-3xl">
          The agents have already been running.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-16">
          You aren&apos;t triggering a query. You&apos;re arriving at a desk that has been
          covering your town since before you searched.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-background p-8 lg:p-10 min-h-[260px]">
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Step {step.n}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] px-2 py-1 rounded-full border border-border text-muted-foreground">
                  {step.tool}
                </span>
              </div>
              <h3 className="font-display text-3xl mb-3">{step.title}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
