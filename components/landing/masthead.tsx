"use client";

import Link from "next/link";

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl tracking-tight">LocalLens</span>
          <span className="hidden sm:inline text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Vol. I · Civic Edition
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#how" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#agents" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">
            The swarm
          </a>
          <a href="#trust" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">
            Trust layer
          </a>
          <a
            href="#search"
            className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Find your edition
          </a>
        </nav>
      </div>
    </header>
  );
}
