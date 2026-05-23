import { SearchDialog } from "./search-dialog";

export function ClosingCTA() {
  return (
    <section className="relative border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-28 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">
            <span className="w-8 h-px bg-foreground/40" />
            Today&apos;s edition
            <span className="w-8 h-px bg-foreground/40" />
          </span>
          <h2 className="font-display text-5xl lg:text-8xl leading-[0.92] tracking-tight mb-8">
            Read what just changed<br />
            <span className="italic text-muted-foreground">in your town.</span>
          </h2>
          <p className="text-lg text-foreground/75 leading-relaxed mb-10">
            The desk is open. The trace is public. Find your edition.
          </p>
          <div className="flex justify-center">
            <SearchDialog large />
          </div>
        </div>
      </div>
    </section>
  );
}
