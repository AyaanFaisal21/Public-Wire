import { NextResponse } from "next/server";
import { runRecallFormDemo } from "@/lib/errand-agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const command =
      typeof body.command === "string" && body.command.trim().length > 0
        ? body.command
        : "I need to fill out my neurology intake form, but I do not remember all the dates.";

    const result = await runRecallFormDemo(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start RecallForm demo", detail: String(error) },
      { status: 500 }
    );
  }
}
