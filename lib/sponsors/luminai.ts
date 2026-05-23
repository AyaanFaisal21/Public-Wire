export function luminaiHealthOpsFrame(errandType: string) {
  // Optional sponsor/vertical bridge:
  // Use this for medical intake, prior auth, insurance, and health-system admin tasks.
  const enabled = errandType === "medical_form";

  return {
    provider: "Luminai",
    enabled,
    purpose: enabled
      ? "Health-system operations path: intake forms, prior-auth style admin tasks, clinical review packets"
      : "Not used for this non-healthcare errand",
  };
}
