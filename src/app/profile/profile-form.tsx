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
        <label className="block font-bold">
          First name
          <input name="first_name" defaultValue={firstName ?? ""} maxLength={80} required
            autoComplete="given-name" className="mt-2 block w-full rounded-xl border-2 border-zinc-900 bg-white px-4 py-3 font-normal" />
        </label>
        <label className="block font-bold">
          Last name
          <input name="last_name" defaultValue={lastName ?? ""} maxLength={80} required
            autoComplete="family-name" className="mt-2 block w-full rounded-xl border-2 border-zinc-900 bg-white px-4 py-3 font-normal" />
        </label>
      </div>
      <button disabled={pending} className="rounded-xl bg-zinc-950 px-6 py-3 font-bold text-white disabled:opacity-50">
        {pending ? "Saving…" : onboarding ? "Save and continue" : "Save names"}
      </button>
      {state.message && <p role="status" className={state.error ? "font-semibold text-red-700" : "font-semibold text-green-800"}>{state.message}</p>}
    </form>
  );
}
