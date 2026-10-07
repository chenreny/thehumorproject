import { redirect } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { profileComplete, requireProfile } from "@/lib/profile";
import { ProfileForm } from "@/app/profile/profile-form";

export default async function Welcome() {
  const { profile } = await requireProfile();
  if (profileComplete(profile)) redirect("/members");

  return (
    <main className="page-shell">
      <div className="page-width">
        <SiteNav signedIn /><div className="panel mx-auto max-w-xl p-8"><p className="eyebrow mb-3">One quick thing</p>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to the club.</h1>
        <p className="my-6 text-sm leading-relaxed text-muted">Add your first and last name to finish setting up your profile.</p>
        <ProfileForm firstName={profile.first_name} lastName={profile.last_name} onboarding /></div>
      </div>
    </main>
  );
}
