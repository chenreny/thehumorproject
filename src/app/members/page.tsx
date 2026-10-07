import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { redirect } from "next/navigation";
import { profileComplete, requireProfile } from "@/lib/profile";

export default async function Members() {
  const { profile } = await requireProfile();
  if (!profileComplete(profile)) redirect("/welcome");

  return (
    <main className="page-shell">
      <div className="page-width">
        <SiteNav signedIn />
        <div className="panel mx-auto mt-8 max-w-2xl p-8">
          <p className="eyebrow">Members only</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">You made it, {profile.first_name} {profile.last_name}.</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted">Turn your campus and city moments into image memes with AI-generated captions, then let the group chat judge the punchlines.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link href="/create" className="button-primary">Make a meme</Link><Link href="/" className="button-secondary">Rate the feed</Link></div>
        </div>
      </div>
    </main>
  );
}
