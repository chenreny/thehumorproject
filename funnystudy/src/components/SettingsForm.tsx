"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { updateAccountSettings, updatePhoneNotificationSettings } from "@/app/settings/actions";
import {
  INITIAL_SETTINGS_STATE,
  NOTIFICATION_SETTINGS,
  type AccountSettings,
} from "@/lib/account-settings";
import type { PhoneSettingsState } from "@/lib/phone-settings";
import { PolicyLinks } from "./PolicyLinks";
import { PhoneSettingsForm } from "./PhoneSettingsForm";

export function SettingsForm({ initialSettings, initialPhoneSettings }: {
  initialSettings: AccountSettings;
  initialPhoneSettings: PhoneSettingsState;
}) {
  const emailFormRef = useRef<HTMLFormElement>(null);
  const phoneFormRef = useRef<HTMLFormElement>(null);
  const savePhoneButtonRef = useRef<HTMLButtonElement>(null);
  const [values, setValues] = useState({
    ...initialSettings,
    first_name: initialSettings.first_name ?? "",
    last_name: initialSettings.last_name ?? "",
  });
  const [emailEdited, setEmailEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [verifiedPhoneOverride, setVerifiedPhone] = useState("");
  const [pendingPhoneOverride, setPendingPhoneOverride] = useState(initialPhoneSettings.pendingPhone);
  const [editingPhone, setEditingPhone] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [emailState, emailAction, emailPending] = useActionState(updateAccountSettings, INITIAL_SETTINGS_STATE);
  const [phoneState, phoneAction, phonePending] = useActionState(updatePhoneNotificationSettings, INITIAL_SETTINGS_STATE);

  useEffect(() => {
    // Action resets run while React's synthetic handlers are paused. A native
    // listener keeps the edited fields intact on both success and validation errors.
    const preserveValues = (event: Event) => event.preventDefault();
    const form = emailFormRef.current;
    if (!form) return;
    form.addEventListener("reset", preserveValues);
    return () => form.removeEventListener("reset", preserveValues);
  }, []);

  useEffect(() => {
    const form = phoneFormRef.current;
    if (!form) return;
    const preserveValues = (event: Event) => event.preventDefault();
    form.addEventListener("reset", preserveValues);
    return () => form.removeEventListener("reset", preserveValues);
  }, [verifiedPhoneOverride, initialPhoneSettings.verifiedPhone, editingPhone]);

  const completeVerification = useCallback((phone: string) => {
    setVerifiedPhone(phone);
    setPendingPhoneOverride("");
    setEditingPhone(false);
    setVerificationCompleted(true);
    requestAnimationFrame(() => savePhoneButtonRef.current?.focus());
  }, []);

  const receivePendingPhone = useCallback((phone: string) => setPendingPhoneOverride(phone), []);

  const verifiedPhone = verifiedPhoneOverride || initialPhoneSettings.verifiedPhone;
  const needsPhone = values.notify_new_study_sms === true || values.notify_new_study_phone_call === true;
  const phoneDetails = { ...initialPhoneSettings, pendingPhone: pendingPhoneOverride, verifiedPhone };

  return (
    <>
      <form id="settings-form" ref={emailFormRef} action={emailAction} onSubmit={() => setEmailEdited(false)} className="space-y-5">
        <fieldset disabled={emailPending} className="space-y-5 disabled:opacity-70">
          <legend className="text-lg font-semibold">Your name</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "first_name" as const, label: "First Name", autoComplete: "given-name" },
              { name: "last_name" as const, label: "Last Name", autoComplete: "family-name" },
            ].map(({ name, label, autoComplete }) => (
              <label key={name} className="block text-sm font-semibold">
                {label}
                <input
                  name={name}
                  autoComplete={autoComplete}
                  required
                  minLength={2}
                  value={values[name]}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setValues((current) => ({ ...current, [name]: value }));
                    setEmailEdited(true);
                  }}
                  className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] shadow-inner outline-none transition focus:ring-2 focus:ring-[var(--input-ring)]"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={emailPending} className="space-y-3 disabled:opacity-70">
          <legend className="text-lg font-semibold">Email notifications</legend>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Get a daily email at noon Eastern while a public study is available for you to finish.
          </p>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold">
            <span className="flex-1">Email</span>
            <select
              name="notify_new_study_email"
              value={values.notify_new_study_email === null ? "unanswered" : values.notify_new_study_email ? "on" : "off"}
              onChange={(event) => {
                const choice = event.currentTarget.value;
                setValues((current) => ({ ...current, notify_new_study_email: choice === "unanswered" ? null : choice === "on" }));
                setEmailEdited(true);
              }}
              className="min-w-0 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
            >
              <option value="unanswered">Not answered</option>
              <option value="on">Yes</option>
              <option value="off">No</option>
            </select>
          </label>
        </fieldset>
        <div className="min-h-6 text-sm" aria-live="polite">
          {!emailPending && !emailEdited && emailState.status !== "idle" ? (
            <p role={emailState.status === "error" ? "alert" : "status"}
              className={emailState.status === "error" ? "text-[var(--error-text)]" : "text-[var(--foreground)]"}>
              {emailState.message}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={emailPending}
          className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] sm:w-auto">
          {emailPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <section id="phone-setup" className="phone-setup-theme mt-7 space-y-4 border-t border-[var(--panel-border)] pt-7" aria-label="Text/phone calls notifications">
        {verificationCompleted && needsPhone ? (
          <p className="rounded-xl border border-[var(--panel-border)] px-4 py-3 text-sm font-semibold" role="status">
            Phone verified. Your choices are still selected. Save changes to finish setup.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="text-base font-bold">Text/phone calls notifications</h3>
          {!verifiedPhone ? <span className="phone-setup-badge shrink-0 rounded-full px-3 py-1 text-xs font-bold">1 of 2 · Verify</span> : null}
        </div>
        {verifiedPhone ? <div className="phone-setup-verified flex items-center justify-between gap-3 rounded-2xl border p-4 sm:p-5">
          <div><p className="text-sm font-bold">✓ Phone number verified</p><p className="phone-setup-verified-detail mt-1 text-xs">{verifiedPhone} · Ready to set reminder choices</p></div>
          <button type="button" onClick={() => pendingPhoneOverride ? setEditingPhone(true) : setEditingPhone((value) => !value)} className="phone-setup-primary rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{pendingPhoneOverride ? "Continue verification" : editingPhone ? "Cancel" : "Change"}</button>
        </div> : null}
        {(!verifiedPhone || editingPhone || pendingPhoneOverride) ? <PhoneSettingsForm key={editingPhone ? "changing" : pendingPhoneOverride ? "pending" : "new"} initialState={phoneDetails} onVerified={completeVerification} onPendingPhone={receivePendingPhone} /> : null}
        {verifiedPhone ? <>
        <form id="phone-notification-form" ref={phoneFormRef} action={phoneAction} onSubmit={() => {
          setPhoneEdited(false);
          setVerificationCompleted(false);
        }}>
          <fieldset disabled={phonePending} className="space-y-3 disabled:opacity-70">
            <legend className="sr-only">Reminder choices</legend>
            <div className="space-y-3">
              {NOTIFICATION_SETTINGS.slice(1).map(({ name, label }) => (
                <label
                  key={name}
                  className="phone-setup-choice flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border bg-[var(--background)] px-4 py-3 text-sm font-semibold"
                >
                  <span className="flex-1">{label}</span>
                  <select
                    name={name}
                    value={values[name] === null ? "unanswered" : values[name] ? "on" : "off"}
                    onChange={(event) => {
                      const choice = event.currentTarget.value;
                      setValues((current) => ({ ...current, [name]: choice === "unanswered" ? null : choice === "on" }));
                      setPhoneEdited(true);
                    }}
                    className="min-w-0 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                  >
                    <option value="unanswered">Not answered</option>
                    <option value="on">Yes</option>
                    <option value="off">No</option>
                  </select>
                </label>
              ))}
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Texts and calls arrive daily at noon Eastern while a public study is available for you to finish.
              Both require a verified phone number.
            </p>
          </fieldset>
        </form>

        <div className="space-y-3">
          <p className="text-sm leading-6 text-[var(--muted)]">Choosing Yes for Text message consents to automated study-reminder texts, at most once daily. Texts are optional. Message and data rates may apply. Reply STOP to stop texts or HELP for help.</p>
          <p className="text-sm leading-6 text-[var(--muted)]">Choosing Yes for Phone call consents to automated calls using an artificial or prerecorded voice from Humor Study, operated by Sparkling Javascript, Inc., at your verified number, at most once daily. Your phone plan may charge for calls. All reminders are optional and are not required to participate.</p>
          <p className="text-sm text-[var(--muted)]"><PolicyLinks /></p>
          <p className="text-sm leading-6 text-[var(--muted)]">Unanswered preferences will be asked about at your next login.</p>
        </div>

        <div className="space-y-3">
          <div className="min-h-6 text-sm">
            {!phonePending && !phoneEdited && phoneState.status !== "idle" ? (
              <p
                role={phoneState.status === "error" ? "alert" : "status"}
                className={phoneState.status === "error" ? "text-[var(--error-text)]" : "text-[var(--foreground)]"}
              >
                {phoneState.message}
              </p>
            ) : null}
          </div>
          <button
            ref={savePhoneButtonRef}
            type="submit"
            form="phone-notification-form"
            disabled={phonePending}
            className="phone-setup-primary w-full rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
          >
            {phonePending ? "Saving…" : "Save changes"}
          </button>
        </div></> : null}
      </section>
    </>
  );
}
