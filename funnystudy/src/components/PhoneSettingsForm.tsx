"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { updatePhoneNumber } from "@/app/settings/phone-actions";
import type { PhoneSettingsState } from "@/lib/phone-settings";
import { SubmitButton } from "./SubmitButton";
import { PolicyLinks } from "./PolicyLinks";

export function PhoneSettingsForm({ initialState, onVerified, onPendingPhone }: {
  initialState: PhoneSettingsState;
  onVerified?: (phone: string) => void;
  onPendingPhone?: (phone: string) => void;
}) {
  const [stage, setStage] = useState<"number" | "code">(initialState.pendingPhone ? "code" : "number");
  const [state, action, pending] = useActionState(async (previousState: PhoneSettingsState, formData: FormData) => {
    const nextState = await updatePhoneNumber(previousState, formData);
    if (formData.get("operation") === "send" && nextState.status === "sent") setStage("code");
    return nextState;
  }, initialState);
  const sectionRef = useRef<HTMLElement>(null);
  const headingId = useId();
  const reportedPhone = useRef("");
  useEffect(() => {
    if (state.status === "sent" && state.pendingPhone) {
      onPendingPhone?.(state.pendingPhone);
    }
    if (state.status === "verified" && state.verifiedPhone && reportedPhone.current !== state.verifiedPhone) {
      reportedPhone.current = state.verifiedPhone;
      onVerified?.(state.verifiedPhone);
    }
  }, [state.status, state.pendingPhone, state.verifiedPhone, onVerified, onPendingPhone]);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const preserveValues = (event: Event) => event.preventDefault();
    section.addEventListener("reset", preserveValues, true);
    return () => section.removeEventListener("reset", preserveValues, true);
  }, []);
  const inputClass = "phone-setup-input mt-2 w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[var(--input-ring)]";
  const primaryClass = "phone-setup-primary rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";
  const secondaryClass = "rounded-xl border border-[var(--panel-border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phone-control)]";
  const currentStage = stage;

  return (
    <section ref={sectionRef} className="phone-setup-card rounded-2xl border p-4 sm:p-5" aria-labelledby={headingId}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="phone-setup-accent-text text-xs font-bold uppercase tracking-[0.16em]">Step {currentStage === "code" ? "2" : "1"} of 2</p>
            <h4 id={headingId} className="mt-1 text-base font-bold text-[var(--foreground)]">{currentStage === "code" ? "Enter the code from your text" : "First, verify your phone number"}</h4>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{currentStage === "code" ? `We sent a six-digit code to ${state.pendingPhone}.` : "Once you enter the code, you can decide whether to receive texts, calls, both, or neither."}</p>
          </div>
          <span aria-hidden="true" className="phone-setup-icon grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg">☎</span>
        </div>

      {currentStage === "number" ? (
        <form action={action} className="space-y-3">
          <input type="hidden" name="operation" value="send" />
          <fieldset disabled={pending} className="space-y-3 disabled:opacity-70">
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              Phone number, including country code
              <input type="tel" name="phone" autoComplete="tel" required maxLength={32}
                defaultValue={state.pendingPhone || state.verifiedPhone} placeholder="+1 212 555 1234" className={inputClass} />
            </label>
            <p className="text-xs text-[var(--muted)]">Example: +1 212 555 1234</p>
            <label className="phone-setup-highlight flex items-start gap-3 rounded-xl border p-3 text-xs leading-5">
              <input type="checkbox" name="verification_sms_consent" value="on" required className="phone-setup-checkbox mt-0.5 h-4 w-4 shrink-0" />
              <span>I agree to receive an automated text message from Humor Study to verify this number. Message and data rates may apply.</span>
            </label>
            <SubmitButton pendingLabel="Sending code…" className={primaryClass}>Send verification code →</SubmitButton>
          </fieldset>
        </form>
      ) : (
        <div className="space-y-3">
          <form action={action} className="space-y-3">
            <input type="hidden" name="operation" value="verify" />
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              Six-digit verification code
              <input type="text" name="code" inputMode="numeric" autoComplete="one-time-code" autoFocus
                required pattern="[0-9]{6}" minLength={6} maxLength={6} placeholder="••••••" className={`${inputClass} tracking-[0.35em]`} />
            </label>
            <p className="text-xs leading-5 text-[var(--muted)]">Code sent to <span className="font-semibold text-[var(--foreground)]">{state.pendingPhone}</span></p>
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton pendingLabel="Verifying…" className={primaryClass}>Verify number →</SubmitButton>
              <button type="button" className={secondaryClass} onClick={() => setStage("number")}>Edit number</button>
            </div>
          </form>
          <form action={action} className="flex flex-wrap items-center gap-2 border-t border-[var(--panel-border)] pt-3">
            <input type="hidden" name="operation" value="send" />
            <input type="hidden" name="phone" value={state.pendingPhone} />
            <label className="flex items-start gap-2 text-xs leading-5 text-[var(--muted)]">
              <input type="checkbox" name="verification_sms_consent" value="on" required className="phone-setup-checkbox mt-0.5 h-4 w-4 shrink-0" />
              I agree to receive a replacement verification text.
            </label>
            <SubmitButton pendingLabel="Resending…" className={secondaryClass}>Resend code</SubmitButton>
          </form>
        </div>
      )}

      <div className="mt-3 min-h-6 text-sm" aria-live="polite">
        {state.message ? <p role={state.status === "error" ? "alert" : "status"}
          className={state.status === "error" ? "text-[var(--error-text)]" : "text-[var(--muted)]"}>{state.message}</p> : null}
      </div>
      <p className="phone-setup-divider border-t pt-3 text-xs leading-5 text-[var(--muted)]">
        Verification does not subscribe you to reminders. <PolicyLinks />
      </p>
    </section>
  );
}
