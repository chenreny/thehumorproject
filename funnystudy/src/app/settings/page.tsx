import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/profile-actions";
import { AccountMenu } from "@/components/AccountMenu";
import { SettingsForm } from "@/components/SettingsForm";
import type { AccountSettings } from "@/lib/account-settings";
import { phoneSettingsForUser } from "@/lib/phone-settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings | Humor Study" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, notify_new_study_email, notify_new_study_sms, notify_new_study_phone_call")
    .eq("id", user.id)
    .single<AccountSettings>();

  if (error) console.error("[Settings] load profile failed", error);
  const displayName = [settings?.first_name, settings?.last_name].filter(Boolean).join(" ").trim()
    || user.email || "your account";
  const phoneSettings = phoneSettingsForUser(user);

  return (
    <div id="settings-root" className="relative flex h-[100svh] min-h-[100svh] flex-col overflow-hidden">
      <header className="settings-app-header"><Link className="settings-brand" href="/"><svg aria-hidden="true" className="settings-brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M7.5 13.5a4.8 4.8 0 0 0 9 0" strokeLinecap="round" /></svg>Humor Study</Link><span className="settings-account-name">{displayName}</span></header>
      <main id="settings-content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="settings-page-inner">
          <Link className="settings-back-link" href="/"><span aria-hidden="true">←</span> Back to studies</Link>
          <div className="settings-page-title"><h1>Settings</h1></div>
          {error || !settings ? (
            <div role="alert" className="settings-card settings-load-error"><p>We couldn’t load your settings. Please try again.</p><a href="/settings" className="notification-secondary">Try again</a></div>
          ) : <SettingsForm initialSettings={settings} initialPhoneSettings={phoneSettings} userId={user.id} email={user.email} />}
        </div>
      </main>
      <AccountMenu displayName={displayName} email={user.email} signOutAction={signOut} />
    </div>
  );
}
