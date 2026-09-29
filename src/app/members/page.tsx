import Link from "next/link";
import { redirect } from "next/navigation";
import { profileComplete, requireProfile } from "@/lib/profile";

export default async function Members() {
  const { profile } = await requireProfile();
  if (!profileComplete(profile)) redirect("/welcome");

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-16 text-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-bold underline">← All jokes</Link>
        <div className="mt-8 rounded-[2rem] border-4 border-zinc-950 bg-rose-300 p-8 shadow-[8px_8px_0_0_#18181b]">
          <p className="text-sm font-black uppercase tracking-widest">Members only</p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">You made it, {profile.first_name}.</h1>
          <p className="mt-5 text-lg font-medium">This page is only available after signing in and completing your profile.</p>
          <Link href="/profile" className="mt-8 inline-block rounded-xl bg-zinc-950 px-5 py-3 font-bold text-white">Edit your profile</Link>
        </div>
      </div>
    </main>
  );
}
