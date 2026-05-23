"use client";

import { useEffect, useState } from "react";
import { SearchDialog } from "./search-dialog";
import { Button } from "@/components/ui/button";

const rotating = ["civic agents.", "an audit trail.", "open sources.", "no slop."];

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setWordIndex((i) => (i + 1) % rotating.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="search"
      className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden paper-grain"
    >
      {/* Newspaper rule grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.18]">
        {[...Array(7)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/30"
            style={{ top: `${(100 / 8) * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/20"
            style={{ left: `${(100 / 6) * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-28 lg:pt-28 lg:pb-36 w-full">
        {/* Dateline */}
        <div
          className={`mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span className="w-8 h-px bg-foreground/40" />
            Local civic edition · Est. 2026
          </span>
        </div>

        {/* Masthead headline */}
        <h1 className="font-display text-[clamp(2.75rem,10vw,8.5rem)] leading-[0.92] tracking-tight mb-8">
          <span className="block">Your town,</span>
          <span className="block">
            covered by{" "}
            <span className="relative inline-block">
              <span key={wordIndex} className="inline-flex">
                {rotating[wordIndex].split("").map((c, i) => (
                  <span
                    key={`${wordIndex}-${i}`}
                    className="inline-block animate-char-in"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    {c === " " ? " " : c}
                  </span>
                ))}
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-foreground/10" />
            </span>
          </span>
        </h1>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20 items-end">
          <p
            className={`text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            LocalLens is a self-running local newspaper. An agent swarm
            monitors public city sites, county notices, transit alerts,
            agendas, and event calendars — and publishes short, cited briefs
            when something actually changes for the people who live there.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-start gap-3 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <SearchDialog large />
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
              asChild
            >
              <a href="#how">How it works</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Dateline footer / scroll cue */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-end justify-between">
          <div className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Issue 001 · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div className="hidden sm:flex flex-col items-center gap-2">
            <span className="text-[0.65rem] font-mono uppercase tracking-[0.22em] text-muted-foreground">Read on</span>
            <span className="scroll-cue" />
          </div>
        </div>
      </div>
    </section>
  );
}
