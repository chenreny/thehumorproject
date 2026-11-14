"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encodeNotificationSkips, NOTIFICATION_SKIPS_COOKIE, readNotificationSkips } from "@/lib/notification-preferences";
import { NOTIFICATION_SETTINGS } from "@/lib/account-settings";
import { normalizePhone } from "@/lib/phone-settings";
import { createClient } from "@/lib/supabase/server";

import type { JourneyState } from "@/lib/notification-journey";

export async function saveNotificationJourney(_state: JourneyState, formData: FormData): Promise<JourneyState> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const choices = NOTIFICATION_SETTINGS.map(({ name }) => ({ name, values: formData.getAll(name) }));
  if (choices.some(({ values }) => values.length !== 1 || !["yes", "no", "skip"].includes(values[0] as string))) {
    return { status: "error", message: "Choose Yes, No, or Later for each reminder type." };
  }
  const selected = Object.fromEntries(choices.map(({ name, values }) => [name, values[0]])) as Record<(typeof NOTIFICATION_SETTINGS)[number]["name"], FormDataEntryValue>;
  if ((selected.notify_new_study_sms === "yes" || selected.notify_new_study_phone_call === "yes") &&
    (!user.phone_confirmed_at || !normalizePhone(user.phone))) {
    return { status: "error", message: "Verify your phone number before choosing Yes for texts or calls." };
  }

  const { data: profile, error: readError } = await supabase.from("profiles")
    .select("notify_new_study_email, notify_new_study_sms, notify_new_study_phone_call")
    .eq("id", user.id).single();
  if (readError || !profile) return { status: "error", message: "We couldn’t load your choices. Please try again." };

  const update: Record<string, boolean | string | null> = { modified_by_user_id: user.id };
  for (const { name } of choices) {
    if (selected[name] === "skip") {
      if (profile[name] !== null) update[name] = null;
    } else update[name] = selected[name] === "yes";
  }
  if (Object.keys(update).length > 1) {
    let query = supabase.from("profiles").update(update).eq("id", user.id);
    for (const { name } of choices) {
      if (!(name in update)) continue;
      query = profile[name] === null ? query.is(name, null) : query.eq(name, profile[name]);
    }
    const { data, error } = await query.select("id").single();
    if (error || !data) return { status: "error", message: "We couldn’t save your choices. Please try again." };
  }
  const cookieStore = await cookies();
  const previousSkips = readNotificationSkips(cookieStore.get(NOTIFICATION_SKIPS_COOKIE)?.value, user.id);
  const skips = new Set(previousSkips);
  for (const { name } of choices) {
    if (selected[name] === "skip") skips.add(name);
    else skips.delete(name);
  }
  cookieStore.set(NOTIFICATION_SKIPS_COOKIE, encodeNotificationSkips(user.id, [...skips]), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
  });
  revalidatePath("/", "layout");
  return { status: "saved", message: "Your reminder choices were saved." };
}

// This is a dismissal marker only; it never grants notification consent.
export async function markNotificationSetupHandled(): Promise<{ error?: string }> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.auth.updateUser({ data: { notification_setup_handled: true } });
  if (error) return { error: "Your choice was kept in this browser, but could not sync to your account." };
  return {};
}
