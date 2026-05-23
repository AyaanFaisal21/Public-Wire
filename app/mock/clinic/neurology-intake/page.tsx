export default function NeurologyIntakePage() {
  return (
    <main className="min-h-screen bg-white p-10 text-black">
      <h1>Neurology New Patient Intake Form Instructions</h1>
      <p>Please complete medication, allergy, symptom timeline, falls, insurance, mobility, and daily living sections before your appointment.</p>
      <section>
        <h2>Activities of Daily Living</h2>
        <p>This includes bathing, dressing, transferring, toileting, eating, and moving around the home.</p>
      </section>
      <section>
        <h2>Falls</h2>
        <p>If the patient reports a fall involving dizziness, head injury, loss of consciousness, weakness, or speech difficulty, ask follow-up safety questions and flag for clinician review.</p>
      </section>
      <section>
        <h2>Uncertain dates</h2>
        <p>Approximate dates are acceptable if clearly marked approximate.</p>
      </section>
    </main>
  );
}
