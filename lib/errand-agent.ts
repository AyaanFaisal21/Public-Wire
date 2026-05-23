import { completedFields, demoEvents, metrics, verifiedPatientContext } from "./demo-data";
import { logRecallFormRun } from "./clickhouse";

export type ErrandResult = {
  sessionId: string;
  transcript: string;
  patient: typeof verifiedPatientContext;
  events: typeof demoEvents;
  fields: typeof completedFields;
  metrics: typeof metrics;
  finalMessage: string;
  clickhouse: {
    enabled: boolean;
    message?: string;
    reason?: string;
  };
};

export async function runRecallFormDemo(command: string): Promise<ErrandResult> {
  const sessionId = `sess_${Date.now()}`;

  const clickhouse = await logRecallFormRun({
    sessionId,
    events: demoEvents,
    metrics,
  });

  return {
    sessionId,
    transcript: command,
    patient: verifiedPatientContext,
    events: demoEvents,
    fields: completedFields,
    metrics,
    clickhouse,
    finalMessage:
      "I completed 21 of 24 fields. I marked 3 fields for review and paused on one red-flag answer about a fall. You did not need to type the form manually.",
  };
}
