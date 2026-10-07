import { SiteNav } from "@/components/site-nav";
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
    <main className="page-shell">
      <div className="page-width">
        <SiteNav signedIn active="profile" /><div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mb-8 break-words text-sm text-muted">Signed in as {user.email}</p>
        <section className="panel p-6 sm:p-7">
          <h2 className="mb-6 text-lg font-semibold">About you</h2>
          <ProfileForm firstName={profile.first_name} lastName={profile.last_name} />
        </section>
        <section className="panel mt-6 p-6 sm:p-7">
          <h2 className="mb-5 text-lg font-semibold">Photo</h2>
          {avatarUrl ? <Image src={avatarUrl} width={128} height={128} unoptimized alt="Your profile photo" className="mb-5 h-24 w-24 rounded-full border border-stone-200 object-cover" />
            : <div className="mb-5 grid size-24 place-items-center rounded-full border border-stone-200 bg-accent-surface text-sm text-accent">No photo</div>}
          <form action="/profile/avatar" method="post" encType="multipart/form-data" className="space-y-4">
            <label className="block text-sm font-semibold">Choose a photo
              <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" required className="mt-3 block w-full min-w-0 text-sm font-normal text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-surface file:px-4 file:py-3 file:font-semibold file:text-accent" />
            </label>
            <p className="text-xs text-muted">JPEG, PNG, or WebP, up to 2 MB. Your photo is publicly viewable.</p>
            <button className="button-primary">Upload photo</button>
          </form>
          {avatar === "saved" && <p role="status" className="mt-4 font-bold text-accent">Photo updated.</p>}
          {avatar === "invalid" && <p role="alert" className="mt-4 font-bold text-accent">Choose a valid image under 2 MB.</p>}
          {avatar === "error" && <p role="alert" className="mt-4 font-bold text-accent">Could not upload your photo. Please try again.</p>}
        </section>
        </div>
      </div>
    </main>
  );
}
