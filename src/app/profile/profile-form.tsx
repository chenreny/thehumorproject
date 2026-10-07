"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = { message: "", error: false };

export function ProfileForm({
  firstName,
  lastName,
  onboarding = false,
}: {
  firstName: string | null;
  lastName: string | null;
  onboarding?: boolean;
}) {
  const [state, action, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="onboarding" value={String(onboarding)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          First name
          <input name="first_name" defaultValue={firstName ?? ""} maxLength={80} required
            autoComplete="given-name" className="field mt-2 block font-normal" />
        </label>
        <label className="block text-sm font-semibold">
          Last name
          <input name="last_name" defaultValue={lastName ?? ""} maxLength={80} required
            autoComplete="family-name" className="field mt-2 block font-normal" />
        </label>
      </div>
      <button disabled={pending} className="button-primary">
        {pending ? "Saving…" : onboarding ? "Save and continue" : "Save names"}
      </button>
      {state.message && <p role="status" className={state.error ? "font-semibold text-accent-strong" : "font-semibold text-accent"}>{state.message}</p>}
    </form>
  );
}
