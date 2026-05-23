import { logRecallFormRun } from "./clickhouse";
import { pickScenario } from "./demo-data";
import { nimbleExtractErrandSources } from "./sponsors/nimble";
import { sensoLoadVerifiedContext } from "./sponsors/senso";
import { luminaiHealthOpsFrame } from "./sponsors/luminai";
import { googleAgentCliFrame } from "./sponsors/google-agent-cli";

export async function runMouthpieceDemo(command: string) {
  const sessionId = `sess_${Date.now()}`;
  const scenario = pickScenario(command);

  const [nimble, senso] = await Promise.all([
    nimbleExtractErrandSources({
      errandType: scenario.type,
      command,
      seededExtractions: scenario.webExtractions,
    }),
    sensoLoadVerifiedContext({
      userId: "demo_user_ari",
      seededContext: scenario.verifiedContext,
    }),
  ]);

  const clickhouse = await logRecallFormRun({
    sessionId,
    events: scenario.events,
    metrics: scenario.metrics,
  });

  const luminai = luminaiHealthOpsFrame(scenario.type);
  const googleAgentCli = googleAgentCliFrame();

  return {
    sessionId,
    transcript: command,
    scenario,
    patient: senso.context,
    events: scenario.events,
    fields: scenario.artifacts,
    metrics: scenario.metrics,
    finalMessage: scenario.finalMessage,
    sponsorStack: {
      nimble,
      senso,
      clickhouse,
      luminai,
      googleAgentCli,
    },
    clickhouse,
  };
}
