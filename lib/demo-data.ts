export type RiskLevel = "low" | "medium" | "high" | "blocked";

export type ErrandEvent = {
  step: number;
  title: string;
  detail: string;
  source: "Voice" | "Senso" | "Nimble" | "Protocol" | "ClickHouse";
  risk: RiskLevel;
  status: "done" | "needs_confirmation" | "blocked" | "review";
};

export const verifiedPatientContext = {
  patientName: "Ari Patel",
  accessMode: "voice-first",
  impairmentContext: "limited hand control + memory difficulty",
  insurance: "Aetna PPO",
  primaryDoctor: "Dr. Elena Morris",
  emergencyContact: "Maya Patel",
  medication: "DemoMed 75mg",
  allergy: "Penicillin",
  mobilityAid: "Power wheelchair",
  preferredCommunication: "Voice or email",
};

export const completedFields = [
  {
    field: "Current medication",
    answer: "DemoMed 75mg",
    provenance: "Senso verified medication profile + patient confirmation",
    confidence: "High",
  },
  {
    field: "Medication allergies",
    answer: "Penicillin",
    provenance: "Senso verified allergy record",
    confidence: "High",
  },
  {
    field: "Primary care physician",
    answer: "Dr. Elena Morris",
    provenance: "Senso verified patient profile",
    confidence: "High",
  },
  {
    field: "Insurance plan",
    answer: "Aetna PPO",
    provenance: "Senso verified insurance profile",
    confidence: "High",
  },
  {
    field: "Symptom onset",
    answer: "Approximately March 2025",
    provenance: "Prior note + patient uncertainty",
    confidence: "Medium, marked approximate",
  },
  {
    field: "Assistance with daily living",
    answer: "Needs help transferring and sometimes dressing",
    provenance: "Patient-confirmed voice answer",
    confidence: "High",
  },
  {
    field: "Recent falls",
    answer: "Possible fall with loss of consciousness",
    provenance: "Patient voice response, red-flag protocol triggered",
    confidence: "Needs clinician review",
  },
];

export const demoEvents: ErrandEvent[] = [
  {
    step: 1,
    title: "Voice command received",
    detail: "Patient said they need help completing a neurology intake form and do not remember all dates.",
    source: "Voice",
    risk: "low",
    status: "done",
  },
  {
    step: 2,
    title: "Verified patient context loaded",
    detail: "Senso returned medication, allergy, insurance, PCP, mobility aid, and preferred communication context.",
    source: "Senso",
    risk: "low",
    status: "done",
  },
  {
    step: 3,
    title: "Form instructions extracted",
    detail: "Nimble extracted clinic instructions and identified required sections: medications, symptoms, insurance, falls, daily living.",
    source: "Nimble",
    risk: "low",
    status: "done",
  },
  {
    step: 4,
    title: "Plain-language interview started",
    detail: "The form question 'activities of daily living' was translated into bathing, dressing, transferring, eating, toileting, and mobility.",
    source: "Protocol",
    risk: "low",
    status: "done",
  },
  {
    step: 5,
    title: "Memory-assisted date answer",
    detail: "Patient was unsure. RecallForm found March 2025 in verified context and asked permission to mark the answer approximate.",
    source: "Senso",
    risk: "medium",
    status: "needs_confirmation",
  },
  {
    step: 6,
    title: "Off-topic response repaired",
    detail: "Patient gave an indirect answer. The agent re-anchored the question and offered yes/no/not sure choices.",
    source: "Protocol",
    risk: "low",
    status: "done",
  },
  {
    step: 7,
    title: "Red flag detected",
    detail: "Patient mentioned waking up on the floor after dizziness. The verifier blocked moving on and required fall follow-up questions.",
    source: "Protocol",
    risk: "high",
    status: "review",
  },
  {
    step: 8,
    title: "Clinician review packet created",
    detail: "Completed fields, provenance, uncertain answers, and red-flag notes were bundled for clinician review.",
    source: "ClickHouse",
    risk: "high",
    status: "review",
  },
];

export const metrics = {
  fieldsDetected: 24,
  fieldsCompleted: 21,
  verifiedFromSenso: 9,
  confirmedByPatient: 10,
  nimbleExplainedQuestions: 5,
  uncertainFields: 3,
  highRiskFlags: 1,
  typingAvoidedPercent: 84,
  estimatedMinutesSaved: 22,
};
