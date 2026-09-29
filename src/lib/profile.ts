import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_path: string | null;
};

export async function requireProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_path")
    .eq("id", user.id)
    .single<Profile>();
  if (error) throw new Error(`Unable to load your profile: ${error.message}`);

  return { supabase, user, profile };
}

export function profileComplete(profile: Profile) {
  return Boolean(profile.first_name?.trim() && profile.last_name?.trim());
}
