import { NextResponse } from "next/server";
import { runPublicWireScan } from "@/lib/public-wire-agent";
import { toPublicWireEdition } from "@/lib/public-wire-edition-adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const area = body.area || "New Brunswick, NJ";
    const slug = body.slug || "new-brunswick";
    const focus = Array.isArray(body.focus) ? body.focus : [];
    const requestedTopic = body.requestedTopic
      ? String(body.requestedTopic).trim()
      : undefined;

    const scan = await runPublicWireScan({ area, slug, focus, requestedTopic });
    const edition = toPublicWireEdition(scan, slug);

    return NextResponse.json({ edition, scan });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate PublicWire edition", detail: String(error) },
      { status: 500 }
    );
  }
}
