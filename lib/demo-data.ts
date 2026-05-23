export type RiskLevel = "low" | "medium" | "high" | "blocked";
export type ErrandType = "shopping" | "return" | "medical_form";

export type ErrandEvent = {
  step: number;
  title: string;
  detail: string;
  source: "Voice" | "Senso" | "Nimble" | "Policy" | "ClickHouse";
  risk: RiskLevel;
  status: "done" | "needs_confirmation" | "blocked" | "review";
};

export type Artifact = {
  field: string;
  answer: string;
  provenance: string;
  confidence: string;
};

export type ErrandScenario = {
  type: ErrandType;
  title: string;
  command: string;
  patientFacingSummary: string;
  verifiedContext: Record<string, string>;
  webExtractions: Artifact[];
  events: ErrandEvent[];
  artifacts: Artifact[];
  metrics: Record<string, number>;
  finalMessage: string;
};

const sharedContext = {
  userName: "Ari Patel",
  accessMode: "voice-first",
  impairmentContext: "limited hand control + memory difficulty",
  deliveryPreference: "delivery this week when possible",
  purchaseRule: "always read final total before purchase",
  highRiskRule: "medical, insurance, government, and payment actions require explicit confirmation",
};

export const scenarios: Record<ErrandType, ErrandScenario> = {
  shopping: {
    type: "shopping",
    title: "Buy essentials",
    command: "Order my usual paper towels, but pick a cheaper bulk option if delivery is this week.",
    patientFacingSummary:
      "Mouthpiece compares products, checks unit price and delivery date, then asks before checkout.",
    verifiedContext: {
      ...sharedContext,
      usualPaperTowelBrand: "Bounty Select-A-Size",
      budgetPreference: "prefer lower unit price if delivery stays within 7 days",
      retailerPreference: "Amazon first, Walmart as backup",
    },
    webExtractions: [
      {
        field: "Usual brand",
        answer: "Bounty Select-A-Size, 12 rolls, $28.99, delivery Tuesday",
        provenance: "Nimble extraction from /mock/retailer/paper-towels",
        confidence: "high",
      },
      {
        field: "Cheaper bulk option",
        answer: "StoreBrand Ultra, 16 rolls, $24.32, delivery Thursday",
        provenance: "Nimble extraction from /mock/retailer/bulk-paper-towels",
        confidence: "high",
      },
      {
        field: "Unit price comparison",
        answer: "$2.42 per roll usual brand vs $1.52 per roll bulk option",
        provenance: "Computed from Nimble extracted price and quantity",
        confidence: "high",
      },
    ],
    events: [
      {
        step: 1,
        title: "Voice command received",
        detail: "User asked to order usual paper towels and allow a cheaper bulk option if delivery is this week.",
        source: "Voice",
        risk: "low",
        status: "done",
      },
      {
        step: 2,
        title: "Verified shopping context loaded",
        detail: "Senso returned usual brand, retailer preference, delivery preference, and purchase confirmation rule.",
        source: "Senso",
        risk: "low",
        status: "done",
      },
      {
        step: 3,
        title: "Retailer options extracted",
        detail: "Nimble extracted product names, prices, quantities, delivery dates, and review summaries from mock retailer pages.",
        source: "Nimble",
        risk: "low",
        status: "done",
      },
      {
        step: 4,
        title: "Cheaper option selected",
        detail: "Bulk option saves about $5 and arrives Thursday, matching the user's delivery preference.",
        source: "Policy",
        risk: "medium",
        status: "needs_confirmation",
      },
      {
        step: 5,
        title: "Checkout blocked until voice confirmation",
        detail: "Purchasing is a payment action. Mouthpiece reads the total and waits for explicit confirmation before placing order.",
        source: "Policy",
        risk: "high",
        status: "blocked",
      },
      {
        step: 6,
        title: "Errand audit stored",
        detail: "ClickHouse recorded compared products, confirmation gate, clicks avoided, and estimated savings.",
        source: "ClickHouse",
        risk: "low",
        status: "done",
      },
    ],
    artifacts: [
      {
        field: "Recommended choice",
        answer: "StoreBrand Ultra 16-pack",
        provenance: "Nimble extracted price, quantity, delivery date",
        confidence: "high",
      },
      {
        field: "Savings",
        answer: "$4.67 estimated savings",
        provenance: "Computed from extracted product data",
        confidence: "high",
      },
      {
        field: "Action status",
        answer: "Ready for final voice confirmation before checkout",
        provenance: "Senso purchase rule",
        confidence: "high",
      },
    ],
    metrics: {
      pagesChecked: 4,
      productsCompared: 5,
      clicksAvoided: 31,
      estimatedMinutesSaved: 14,
      confirmationsRequired: 1,
      highRiskBlocks: 1,
      estimatedSavingsDollars: 5,
    },
    finalMessage:
      "I found a cheaper bulk paper towel option that arrives Thursday and saves about five dollars. Because this is a purchase, I need your final confirmation before checkout.",
  },

  return: {
    type: "return",
    title: "Return item",
    command: "Check if my headphones are still returnable and start the return if they are.",
    patientFacingSummary:
      "Mouthpiece checks the return window, prepares the return, and asks before submission.",
    verifiedContext: {
      ...sharedContext,
      preferredReturnMethod: "UPS dropoff if free pickup is unavailable",
      recentOrder: "SoundCore QuietFit headphones",
      orderDate: "May 6, 2026",
    },
    webExtractions: [
      {
        field: "Return window",
        answer: "Return eligible until June 5, 2026",
        provenance: "Nimble extraction from /mock/orders/headphones",
        confidence: "high",
      },
      {
        field: "Refund method",
        answer: "Refund to original payment method",
        provenance: "Nimble extraction from /mock/orders/headphones",
        confidence: "high",
      },
      {
        field: "Return method",
        answer: "UPS dropoff available, free label",
        provenance: "Nimble extraction from /mock/orders/headphones",
        confidence: "high",
      },
    ],
    events: [
      {
        step: 1,
        title: "Voice command received",
        detail: "User asked whether headphones are returnable and asked Mouthpiece to start the return.",
        source: "Voice",
        risk: "low",
        status: "done",
      },
      {
        step: 2,
        title: "Order context loaded",
        detail: "Senso returned recent order name, order date, and preferred return method.",
        source: "Senso",
        risk: "low",
        status: "done",
      },
      {
        step: 3,
        title: "Return policy extracted",
        detail: "Nimble found the item is still inside the return window and extracted refund and dropoff options.",
        source: "Nimble",
        risk: "low",
        status: "done",
      },
      {
        step: 4,
        title: "Return prepared",
        detail: "Mouthpiece prepared the return label flow and selected UPS dropoff based on saved preference.",
        source: "Policy",
        risk: "medium",
        status: "needs_confirmation",
      },
      {
        step: 5,
        title: "Submission paused",
        detail: "Submitting a return changes order state, so Mouthpiece waits for voice confirmation.",
        source: "Policy",
        risk: "medium",
        status: "needs_confirmation",
      },
      {
        step: 6,
        title: "Errand audit stored",
        detail: "ClickHouse recorded return eligibility, selected method, confirmation gate, and clicks avoided.",
        source: "ClickHouse",
        risk: "low",
        status: "done",
      },
    ],
    artifacts: [
      {
        field: "Return eligibility",
        answer: "Eligible until June 5, 2026",
        provenance: "Nimble extracted order page",
        confidence: "high",
      },
      {
        field: "Prepared method",
        answer: "UPS dropoff with free label",
        provenance: "Senso preference + Nimble return options",
        confidence: "high",
      },
      {
        field: "Action status",
        answer: "Ready for voice confirmation before return submission",
        provenance: "Risk policy",
        confidence: "high",
      },
    ],
    metrics: {
      pagesChecked: 3,
      formsPrepared: 1,
      clicksAvoided: 26,
      estimatedMinutesSaved: 11,
      confirmationsRequired: 1,
      highRiskBlocks: 0,
      estimatedSavingsDollars: 0,
    },
    finalMessage:
      "Your headphones are still returnable until June 5. I prepared a UPS dropoff return with a free label. I need your confirmation before submitting it.",
  },

  medical_form: {
    type: "medical_form",
    title: "Medical form",
    command: "Help me fill out my neurology intake form. I do not remember all the dates.",
    patientFacingSummary:
      "Mouthpiece turns a confusing medical form into a voice-guided interview with memory help and uncertainty flags.",
    verifiedContext: {
      ...sharedContext,
      insurance: "Aetna PPO",
      primaryDoctor: "Dr. Elena Morris",
      medication: "DemoMed 75mg",
      allergy: "Penicillin",
      mobilityAid: "Power wheelchair",
    },
    webExtractions: [
      {
        field: "Clinic instructions",
        answer: "Complete medication, allergies, symptom timeline, falls, insurance, and daily living sections before visit.",
        provenance: "Nimble extraction from /mock/clinic/neurology-intake",
        confidence: "high",
      },
      {
        field: "Activities of daily living",
        answer: "Bathing, dressing, transferring, toileting, eating, and moving around the home",
        provenance: "Nimble extraction from /mock/clinic/neurology-intake",
        confidence: "high",
      },
      {
        field: "Red-flag fall protocol",
        answer: "Ask follow-up if fall involved head injury, loss of consciousness, dizziness, weakness, or speech difficulty.",
        provenance: "Senso clinician-approved intake protocol",
        confidence: "high",
      },
    ],
    events: [
      {
        step: 1,
        title: "Voice command received",
        detail: "Patient asked for help completing a neurology intake form and said they do not remember all dates.",
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
        detail: "Nimble extracted clinic instructions and identified required sections.",
        source: "Nimble",
        risk: "low",
        status: "done",
      },
      {
        step: 4,
        title: "Memory-assisted answer",
        detail: "Patient was unsure about symptom onset. Mouthpiece found March 2025 in verified context and asked to mark it approximate.",
        source: "Senso",
        risk: "medium",
        status: "needs_confirmation",
      },
      {
        step: 5,
        title: "Red flag detected",
        detail: "Patient mentioned waking up on the floor after dizziness. Protocol blocked moving on and required fall follow-up questions.",
        source: "Policy",
        risk: "high",
        status: "review",
      },
      {
        step: 6,
        title: "Review packet created",
        detail: "Completed fields, provenance, uncertain answers, and red-flag notes were bundled for clinician review.",
        source: "ClickHouse",
        risk: "high",
        status: "review",
      },
    ],
    artifacts: [
      {
        field: "Fields completed",
        answer: "21 of 24",
        provenance: "Form state tracked by ClickHouse",
        confidence: "high",
      },
      {
        field: "Uncertain answers",
        answer: "Symptom onset approximate, MRI date unknown, referral number missing",
        provenance: "Patient voice answers + Senso context",
        confidence: "needs review",
      },
      {
        field: "Safety flag",
        answer: "Possible fall with loss of consciousness",
        provenance: "Patient voice response + clinician-approved protocol",
        confidence: "requires clinician review",
      },
    ],
    metrics: {
      pagesChecked: 2,
      fieldsPrepared: 24,
      clicksAvoided: 84,
      estimatedMinutesSaved: 22,
      confirmationsRequired: 3,
      highRiskBlocks: 1,
      estimatedSavingsDollars: 0,
    },
    finalMessage:
      "I completed 21 of 24 fields, marked 3 fields for review, and paused on one red-flag answer about a fall. You did not need to type the form manually.",
  },
};

export function pickScenario(command: string): ErrandScenario {
  const normalized = command.toLowerCase();

  if (
    normalized.includes("return") ||
    normalized.includes("headphones") ||
    normalized.includes("refund")
  ) {
    return scenarios.return;
  }

  if (
    normalized.includes("form") ||
    normalized.includes("neurology") ||
    normalized.includes("dates")
  ) {
    return scenarios.medical_form;
  }

  return scenarios.shopping;
}
