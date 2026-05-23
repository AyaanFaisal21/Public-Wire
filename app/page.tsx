"use client";

import { useState } from "react";

type ErrandEvent = {
  step: number;
  title: string;
  detail: string;
  source: string;
  risk: string;
  status: string;
};

type Field = {
  field: string;
  answer: string;
  provenance: string;
  confidence: string;
};

type DemoResult = {
  sessionId: string;
  transcript: string;
  patient: Record<string, string>;
  events: ErrandEvent[];
  fields: Field[];
  metrics: Record<string, number>;
  finalMessage: string;
};

const defaultCommand =
  "I need to fill out my neurology intake form, but I do not remember all the dates.";

function badgeClass(value: string) {
  if (value === "high") return "bg-red-100 text-red-800 border-red-200";
  if (value === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (value === "review") return "bg-purple-100 text-purple-800 border-purple-200";
  if (value === "needs_confirmation") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

export default function Home() {
  const [command, setCommand] = useState(defaultCommand);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function startDemo() {
    setLoading(true);
    const res = await fetch("/api/errand/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);

    if ("speechSynthesis" in window && data.finalMessage) {
      const utterance = new SpeechSynthesisUtterance(data.finalMessage);
      utterance.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-[#1f1a17]">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex rounded-full border border-black/10 bg-[#f6f2ea] px-3 py-1 text-sm font-medium">
            RecallForm MVP
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight">
            Voice-guided medical forms for patients who cannot type easily or rely on memory.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-black/65">
            RecallForm reads confusing intake forms, explains each question in plain language,
            fills answers from verified patient context, and flags uncertainty before a clinician sees it.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Patient voice command</h2>
            <p className="mt-2 text-sm text-black/60">
              Demo path: neurology intake form, memory difficulty, red-flag fall response.
            </p>

            <textarea
              className="mt-5 h-36 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] p-4 text-base outline-none focus:border-black/30"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />

            <button
              onClick={startDemo}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-black px-5 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Running intake..." : "Start voice intake simulation"}
            </button>

            {result && (
              <div className="mt-6 rounded-2xl border border-black/10 bg-[#f6f2ea] p-4">
                <h3 className="font-semibold">Spoken response</h3>
                <p className="mt-2 text-black/70">{result.finalMessage}</p>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Verified patient context</h2>
            <p className="mt-2 text-sm text-black/60">
              Senso layer: verified memory the patient does not need to repeat.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {result ? (
                Object.entries(result.patient).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
                    <div className="text-xs uppercase tracking-wide text-black/40">
                      {key.replaceAll(/([A-Z])/g, " $1")}
                    </div>
                    <div className="mt-1 font-medium">{value}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-black/20 bg-[#fbfaf7] p-6 text-black/50 sm:col-span-2">
                  Run the simulation to load verified context.
                </div>
              )}
            </div>
          </section>
        </div>

        {result && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Live intake timeline</h2>
              <p className="mt-2 text-sm text-black/60">
                ClickHouse layer: every question, answer, risk gate, and repair event becomes structured state.
              </p>

              <div className="mt-6 space-y-4">
                {result.events.map((event) => (
                  <div key={event.step} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                        {event.step}
                      </span>
                      <h3 className="font-semibold">{event.title}</h3>
                      <span className={`rounded-full border px-2 py-1 text-xs ${badgeClass(event.risk)}`}>
                        {event.risk}
                      </span>
                      <span className={`rounded-full border px-2 py-1 text-xs ${badgeClass(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-xs">
                        {event.source}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-black/65">{event.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-semibold">Form completion</h2>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {Object.entries(result.metrics).map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
                      <div className="text-3xl font-semibold">{value}</div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-black/45">
                        {key.replaceAll(/([A-Z])/g, " $1")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-red-900">Verifier intervention</h2>
                <p className="mt-3 text-red-900/75">
                  The agent tried to continue after the patient mentioned waking up on the floor.
                  The protocol blocked the next question and required fall follow-ups before completion.
                </p>
              </section>
            </aside>
          </div>
        )}

        {result && (
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Completed fields with provenance</h2>
            <p className="mt-2 text-sm text-black/60">
              Differentiator: every answer is labeled by source, confidence, and review status.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {result.fields.map((field) => (
                <div key={field.field} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
                  <div className="text-sm font-semibold text-black/50">{field.field}</div>
                  <div className="mt-1 text-lg font-semibold">{field.answer}</div>
                  <div className="mt-3 text-sm text-black/60">
                    <strong>Source:</strong> {field.provenance}
                  </div>
                  <div className="mt-1 text-sm text-black/60">
                    <strong>Confidence:</strong> {field.confidence}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
