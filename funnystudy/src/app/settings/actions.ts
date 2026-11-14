"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SettingsFormState } from "@/lib/account-settings";
import { normalizePhone } from "@/lib/phone-settings";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/supabase";

export async function updateAccountSettings(
  _previousState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const first = formData.get("first_name");
  const last = formData.get("last_name");
  if (
    typeof first !== "string" || typeof last !== "string" ||
    first.trim().length < 2 || last.trim().length < 2
  ) {
    return { status: "error", message: "Please enter a first and last name with at least two characters each." };
  }

  const update: TablesUpdate<"profiles"> = {
    first_name: first.trim(),
    last_name: last.trim(),
    modified_by_user_id: user.id,
  };
  const email = readChoice(formData, "notify_new_study_email");
  if (email === undefined) return invalidChoice();
  update.notify_new_study_email = email;

  return saveSettings(supabase, user.id, update, "Name and email preference saved.");
}

export async function updateProfileNames(
  _previousState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const first = formData.get("first_name");
  const last = formData.get("last_name");
  if (typeof first !== "string" || typeof last !== "string" ||
    first.trim().length < 2 || last.trim().length < 2) {
    return { status: "error", message: "Please enter a first and last name with at least two characters each." };
  }

  return saveSettings(supabase, user.id, {
    first_name: first.trim(),
    last_name: last.trim(),
    modified_by_user_id: user.id,
  }, "Your name was saved.");
}

export async function updatePhoneNotificationSettings(
  _previousState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sms = readChoice(formData, "notify_new_study_sms");
  const call = readChoice(formData, "notify_new_study_phone_call");
  if (sms === undefined || call === undefined) return invalidChoice();

  if ((sms || call) && (!user.phone_confirmed_at || !normalizePhone(user.phone))) {
    return {
      status: "error",
      message: "Verify a phone number above before saving Yes for text messages or phone calls.",
    };
  }

  return saveSettings(supabase, user.id, {
    notify_new_study_sms: sms,
    notify_new_study_phone_call: call,
    modified_by_user_id: user.id,
  }, "Text and call preferences saved.");
}

function readChoice(formData: FormData, name: string): boolean | null | undefined {
  const values = formData.getAll(name);
  if (values.length !== 1 || typeof values[0] !== "string") return undefined;
  if (values[0] === "unanswered") return null;
  if (values[0] === "on") return true;
  if (values[0] === "off") return false;
  return undefined;
}

function invalidChoice(): SettingsFormState {
  return { status: "error", message: "Please select valid notification preferences and try again." };
}

async function saveSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  update: TablesUpdate<"profiles">,
  successMessage: string,
): Promise<SettingsFormState> {
  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[Settings] save profile failed", error);
    return { status: "error", message: "We couldn’t save your settings. Please try again." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: successMessage };
}
