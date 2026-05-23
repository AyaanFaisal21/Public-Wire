import { logRecallFormRun } from "./clickhouse";
import { pickScenario } from "./demo-data";

export async function runMouthpieceDemo(command: string) {
  const sessionId = `sess_${Date.now()}`;
  const scenario = pickScenario(command);

  const clickhouse = await logRecallFormRun({
    sessionId,
    events: scenario.events,
    metrics: scenario.metrics,
  });

  return {
    sessionId,
    transcript: command,
    scenario,
    patient: scenario.verifiedContext,
    events: scenario.events,
    fields: scenario.artifacts,
    metrics: scenario.metrics,
    finalMessage: scenario.finalMessage,
    clickhouse,
  };
}
