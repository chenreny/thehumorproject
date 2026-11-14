"use client";

export type ReminderChoice = "yes" | "no" | "skip";

export function ReminderChoiceControl({ label, description, value, onChange, consent }: {
  label: string;
  description: string;
  value: ReminderChoice | null;
  onChange: (choice: ReminderChoice) => void;
  consent?: string;
}) {
  return <section className="reminder-channel">
    <div className="reminder-channel-head">
      <div>
        <h2>{label}</h2>
        <p>{description}</p>
      </div>
      <div className="reminder-choice-set" role="group" aria-label={`${label} reminder choice`}>
        {(["yes", "no", "skip"] as const).map((choice) => <button key={choice} type="button"
          aria-pressed={value === choice}
          className={`reminder-choice${value === choice ? " is-selected" : ""}`}
          onClick={() => onChange(choice)}>
          {choice === "skip" ? "Later" : choice === "yes" ? "Yes" : "No"}
        </button>)}
      </div>
    </div>
    {value === "yes" && consent ? <p className="reminder-channel-consent">{consent}</p> : null}
  </section>;
}
