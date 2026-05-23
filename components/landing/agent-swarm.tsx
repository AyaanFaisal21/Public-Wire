const AGENTS = [
  { name: "Area Mapper", role: "Resolves a search into the right civic layers — state, county, city, neighborhood, campus, services." },
  { name: "Source Scout", role: "Finds and validates official and public sources for the area." },
  { name: "Source Monitor", role: "Repeatedly checks each source for new posts, edits, removals, and date shifts." },
  { name: "Extractor", role: "Turns hostile civic web pages and PDFs into structured civic events." },
  { name: "Change Detector", role: "Diffs current snapshots against memory. Knows what is new, stale, duplicate, or updated." },
  { name: "Editor", role: "Filters routine administrative noise. Keeps what affects residents." },
  { name: "Verifier", role: "Checks each claim against source text. Assigns confidence." },
  { name: "Writer", role: "Drafts the brief from verified facts only. Never invents." },
  { name: "Mentor", role: "Reviews the reporting agents&apos; work — sources, claims, behavior — before publication." },
  { name: "Publisher", role: "Posts approved briefs to the LocalLens edition and to the public cited artifact." },
  { name: "Audit Translator", role: "Turns raw agent traces into the plain-English &ldquo;how this story was made&rdquo; log." },
  { name: "Update Agent", role: "Keeps published briefs current as sources change after publication." },
];

export function AgentSwarm() {
  return (
    <section id="agents" className="relative border-t border-border bg-card/40 paper-grain">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">§ 03</span>
          <span className="rule flex-1 max-w-[180px]" />
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">The swarm</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 mb-16">
          <h2 className="font-display text-4xl lg:text-6xl leading-[0.95] tracking-tight">
            Twelve narrow agents.<br />
            <span className="italic text-muted-foreground">One reviewable chain.</span>
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed">
            One large agent that searches, reasons, writes, verifies, and publishes
            tends to hallucinate. So we don&apos;t use one. Each part of the workflow
            is a small agent with a smaller context, a narrower job, and an
            output that the next agent — or a human — can check.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border ink-shadow">
          {AGENTS.map((agent, idx) => (
            <div key={agent.name} className="bg-background p-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Agent {String(idx + 1).padStart(2, "0")}
                </span>
                {idx === 8 && (
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-foreground text-background">
                    Reviewer
                  </span>
                )}
              </div>
              <h3 className="font-display text-2xl mb-2">{agent.name}</h3>
              <p
                className="text-sm text-foreground/70 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: agent.role }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
