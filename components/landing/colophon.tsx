export function Colophon() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="font-display text-3xl mb-2">LocalLens</div>
            <p className="text-sm text-muted-foreground max-w-md">
              A self-running local newspaper network. Civic agents monitor, verify,
              publish, and explain — so residents can actually read what just changed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Editions
              </div>
              <ul className="space-y-1">
                <li><a href="/local/new-brunswick" className="hover:underline">New Brunswick</a></li>
                <li><span className="text-muted-foreground">Newark · soon</span></li>
                <li><span className="text-muted-foreground">Jersey City · soon</span></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Desk
              </div>
              <ul className="space-y-1">
                <li><a href="#how" className="hover:underline">How it works</a></li>
                <li><a href="#agents" className="hover:underline">The swarm</a></li>
                <li><a href="#trust" className="hover:underline">Trust layer</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="rule mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <span>LocalLens · Civic edition · Vol. I</span>
          <span>Built for the Agentic Engineering Hack · 2026</span>
        </div>
      </div>
    </footer>
  );
}
