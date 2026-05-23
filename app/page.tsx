import { Masthead } from "@/components/landing/masthead";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AgentSwarm } from "@/components/landing/agent-swarm";
import { TrustLayer } from "@/components/landing/trust-layer";
import { Stack } from "@/components/landing/stack";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { Colophon } from "@/components/landing/colophon";

export default function HomePage() {
  return (
    <>
      <Masthead />
      <main className="relative">
        <Hero />
        <Problem />
        <HowItWorks />
        <AgentSwarm />
        <TrustLayer />
        <Stack />
        <ClosingCTA />
      </main>
      <Colophon />
    </>
  );
}
