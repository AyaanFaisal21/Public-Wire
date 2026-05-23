import { NextResponse } from "next/server";
import { runPublicWireScan } from "@/lib/local-lens-agent";

export async function POST() {
  try {
    const result = await runPublicWireScan();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run PublicWire scan", detail: String(error) },
      { status: 500 }
    );
  }
}
