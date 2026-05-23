import { NextResponse } from "next/server";
import { runLocalLensScan } from "@/lib/local-lens-agent";

export async function POST() {
  try {
    const result = await runLocalLensScan();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "LocalLens scan failed", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result = await runLocalLensScan();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "LocalLens scan failed", detail: String(error) },
      { status: 500 },
    );
  }
}
