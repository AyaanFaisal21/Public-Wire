import { Masthead } from "@/components/landing/masthead";
import { Colophon } from "@/components/landing/colophon";
import { LocalEdition } from "@/components/edition/local-edition";

type AreaPageProps = {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ focus?: string }>;
};

function prettifyArea(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: AreaPageProps) {
  const { area } = await params;
  const pretty = prettifyArea(area);
  return {
    title: `LocalLens ${pretty} — Today's Civic Briefing`,
    description: `Self-running civic newsroom for ${pretty}. Agent-monitored. Source-cited. Mentor-reviewed.`,
  };
}

export default async function AreaPage({ params, searchParams }: AreaPageProps) {
  const { area } = await params;
  const { focus } = await searchParams;
  const focusList = focus ? focus.split(",") : [];
  const pretty = prettifyArea(area);

  return (
    <>
      <Masthead />
      <main className="relative">
        <LocalEdition areaSlug={area} areaName={pretty} focus={focusList} />
      </main>
      <Colophon />
    </>
  );
}
