import { NextResponse } from "next/server";
import { runMouthpieceDemo } from "@/lib/errand-agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const command =
      typeof body.command === "string" && body.command.trim().length > 0
        ? body.command
        : "Order my usual paper towels, but pick a cheaper bulk option if delivery is this week.";

    const result = await runMouthpieceDemo(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start Mouthpiece demo", detail: String(error) },
      { status: 500 }
    );
  }
}
