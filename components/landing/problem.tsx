export function Problem() {
  return (
    <section className="relative border-t border-border bg-card/40 paper-grain">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">§ 01</span>
          <span className="rule flex-1 max-w-[180px]" />
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">The problem</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-20">
          <h2 className="font-display text-4xl lg:text-6xl leading-[0.95] tracking-tight">
            Public information,<br />
            <span className="italic text-muted-foreground">privately ignored.</span>
          </h2>

          <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
            <p>
              Every day, your town hall posts agendas. Your county posts notices. Transit
              posts service changes. Your school district updates calendars. Permits get
              filed. PDFs get uploaded.
            </p>
            <p>
              All of it is public. None of it is readable. Most of it is buried until it
              affects someone — and by then it&apos;s too late to do anything about it.
            </p>
            <p className="font-mono text-sm text-muted-foreground border-l-2 border-foreground/40 pl-4">
              The information isn&apos;t hidden. It&apos;s just shaped like
              government, not like a newspaper.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
