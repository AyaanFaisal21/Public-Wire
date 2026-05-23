import type { Artifact } from "@/lib/demo-data";

export async function nimbleExtractErrandSources(params: {
  errandType: string;
  command: string;
  seededExtractions: Artifact[];
}) {
  // Hackathon adapter:
  // Replace this with real Nimble Web Search Agent calls when API credentials are available.
  // Role: turn messy webpages into structured options, policies, prices, delivery dates, and form instructions.
  return {
    provider: "Nimble",
    mode: process.env.NIMBLE_API_KEY ? "api-ready" : "seeded-demo",
    purpose: "Live web extraction for hostile web errands",
    extracted: params.seededExtractions,
  };
}
