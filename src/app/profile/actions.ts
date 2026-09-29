"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/profile";

export type ProfileFormState = { message: string; error: boolean };

export async function saveProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const onboarding = formData.get("onboarding") === "true";

  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) {
    return { message: "Enter both names, each no longer than 80 characters.", error: true };
  }

  const { supabase, user } = await requireProfile();
  const { error } = await supabase.from("profiles").update({
    first_name: firstName,
    last_name: lastName,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) return { message: `Could not save your profile: ${error.message}`, error: true };
  revalidatePath("/profile");
  revalidatePath("/members");
  if (onboarding) redirect("/members");
  return { message: "Profile saved.", error: false };
}
