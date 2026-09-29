import Link from "next/link";
import Image from "next/image";
import { requireProfile } from "@/lib/profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ avatar?: string }>;
}) {
  const { supabase, user, profile } = await requireProfile();
  const avatarUrl = profile.avatar_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : null;
  const { avatar } = await searchParams;

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-16 text-zinc-950">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex gap-6 font-bold underline"><Link href="/">All jokes</Link><Link href="/members">Members</Link></nav>
        <h1 className="mb-2 text-5xl font-black">Your profile</h1>
        <p className="mb-8 text-zinc-700">Signed in as {user.email}</p>
        <section className="rounded-[2rem] border-4 border-zinc-950 bg-yellow-300 p-7 shadow-[8px_8px_0_0_#18181b]">
          <h2 className="mb-6 text-2xl font-black">About you</h2>
          <ProfileForm firstName={profile.first_name} lastName={profile.last_name} />
        </section>
        <section className="mt-10 rounded-[2rem] border-4 border-zinc-950 bg-rose-300 p-7 shadow-[8px_8px_0_0_#18181b]">
          <h2 className="mb-5 text-2xl font-black">Photo</h2>
          {avatarUrl ? <Image src={avatarUrl} width={128} height={128} unoptimized alt="Your profile photo" className="mb-5 h-32 w-32 rounded-full border-4 border-zinc-950 object-cover" />
            : <div className="mb-5 flex h-32 w-32 items-center justify-center rounded-full border-4 border-zinc-950 bg-white font-bold">No photo</div>}
          <form action="/profile/avatar" method="post" encType="multipart/form-data" className="space-y-4">
            <label className="block font-bold">Choose a photo
              <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" required className="mt-2 block w-full" />
            </label>
            <p className="text-sm">JPEG, PNG, or WebP, up to 2 MB. Your photo is publicly viewable.</p>
            <button className="rounded-xl bg-zinc-950 px-6 py-3 font-bold text-white">Upload photo</button>
          </form>
          {avatar === "saved" && <p role="status" className="mt-4 font-bold text-green-800">Photo updated.</p>}
          {avatar === "invalid" && <p role="alert" className="mt-4 font-bold text-red-800">Choose a valid image under 2 MB.</p>}
          {avatar === "error" && <p role="alert" className="mt-4 font-bold text-red-800">Could not upload your photo. Please try again.</p>}
        </section>
        <form action="/auth/logout" method="post" className="mt-10"><button className="font-bold underline">Sign out</button></form>
      </div>
    </main>
  );
}
