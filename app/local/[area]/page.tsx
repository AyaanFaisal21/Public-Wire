import { Masthead } from "@/components/landing/masthead";
import { Colophon } from "@/components/landing/colophon";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { LocalEdition } from "@/components/edition/local-edition";
import { getEditionBySlug } from "@/content/local-lens-demo";

type AreaPageProps = {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ focus?: string; areaName?: string }>;
};

function prettifyArea(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: AreaPageProps) {
  const { area } = await params;
  const edition = getEditionBySlug(area);
  const pretty = edition.area || prettifyArea(area);
  return {
    title: `LocalLens ${pretty} , Today's Civic Briefing`,
    description: `Self-running civic newsroom for ${pretty}. Agent-monitored. Source-cited. Mentor-reviewed.`,
  };
}

export default async function AreaPage({ params, searchParams }: AreaPageProps) {
  const { area } = await params;
  const { focus, areaName } = await searchParams;
  const focusList = focus ? focus.split(",") : [];
  const pretty = areaName
    ? decodeURIComponent(areaName)
    : getEditionBySlug(area).area || prettifyArea(area);

  return (
    <>
      <LenisProvider />
      <Masthead variant="solid" />
      <main>
        <LocalEdition areaSlug={area} areaName={pretty} focus={focusList} />
      </main>
      <Colophon />
    </>
  );
}
