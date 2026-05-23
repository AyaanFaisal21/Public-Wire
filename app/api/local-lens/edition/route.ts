import { NextResponse } from "next/server";
import { runLocalLensScan } from "@/lib/local-lens-agent";
import { toLocalEditionDemo } from "@/lib/local-lens-edition-adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const area = body.area || "New Brunswick, NJ";
    const slug = body.slug || "new-brunswick";
    const focus = Array.isArray(body.focus) ? body.focus : [];

    const scan = await runLocalLensScan({ area, slug, focus });
    const edition = toLocalEditionDemo(scan, slug);

    return NextResponse.json({ edition, scan });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate LocalLens edition", detail: String(error) },
      { status: 500 }
    );
  }
}
