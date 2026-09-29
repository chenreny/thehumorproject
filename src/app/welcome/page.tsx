import { redirect } from "next/navigation";
import { profileComplete, requireProfile } from "@/lib/profile";
import { ProfileForm } from "@/app/profile/profile-form";

export default async function Welcome() {
  const { profile } = await requireProfile();
  if (profileComplete(profile)) redirect("/members");

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-16 text-zinc-950">
      <div className="mx-auto max-w-xl rounded-[2rem] border-4 border-zinc-950 bg-yellow-300 p-8 shadow-[8px_8px_0_0_#18181b]">
        <p className="mb-3 text-sm font-black uppercase tracking-widest">One quick thing</p>
        <h1 className="text-4xl font-black">Welcome to the club.</h1>
        <p className="my-6 text-lg">Add your first and last name to finish setting up your profile.</p>
        <ProfileForm firstName={profile.first_name} lastName={profile.last_name} onboarding />
      </div>
    </main>
  );
}
