"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type NotificationEmailState = {
  status: "idle" | "error" | "success";
  message: string;
  notificationEmail: string | null;
};

export async function updateNotificationEmail(
  previousState: NotificationEmailState,
  formData: FormData,
): Promise<NotificationEmailState> {
  const supabase = await createClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values = formData.getAll("notification_email");
  const value = values.length === 1 && typeof values[0] === "string" ? values[0].trim() : "";
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { ...previousState, status: "error", message: "Enter a valid email address." };
  }

  const notificationEmail = value.toLowerCase() === user.email?.toLowerCase() ? null : value;
  const { data, error } = await supabase.from("profiles")
    .update({ notification_email: notificationEmail, modified_by_user_id: user.id })
    .eq("id", user.id)
    .select("notification_email")
    .single();
  if (error || !data) {
    console.error("[Settings] save notification email failed", error);
    return { ...previousState, status: "error", message: "We couldn’t save that email address. Please try again." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Notification email saved.", notificationEmail: data.notification_email };
}
