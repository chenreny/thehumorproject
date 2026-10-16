import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { requireProfile } from "@/lib/profile";
import { ProfileForm } from "./profile-form";
import styles from "./profile.module.css";

function getInitials(firstName: string | null, lastName: string | null) {
  const initials = [firstName, lastName]
    .map((name) => name?.trim().charAt(0))
    .filter(Boolean)
    .join("");

  return initials.toLocaleUpperCase() || "Y";
}

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
  const displayName = [profile.first_name, profile.last_name]
    .map((name) => name?.trim())
    .filter(Boolean)
    .join(" ");
  const initials = getInitials(profile.first_name, profile.last_name);

  return (
    <main className={`page-shell ${styles.profilePage} create-page`}>
      <div className="page-width">
        <SiteNav signedIn active="profile" />

        <div className={styles.profileWrap}>
          <header className={styles.heading}>
            <div>
              <p className={styles.kicker}>THE HUMOR PROJECT / PROFILE</p>
              <h1>All about you</h1>
              <p className={styles.subtitle}>Your name, your photo, your little corner of the internet.</p>
            </div>
            <div className={styles.doodle} aria-hidden="true">✳　☾</div>
          </header>

          <div className={styles.cardGrid}>
            <section className={styles.card} aria-labelledby="profile-basics-title">
              <span className={styles.index}>01&nbsp; THE BASICS</span>
              <h2 id="profile-basics-title">What should we call you?</h2>
              <p className={styles.hint}>Signed in as {user.email}</p>
              <ProfileForm firstName={profile.first_name} lastName={profile.last_name} />
            </section>

            <section className={`${styles.card} ${styles.photoCard}`} aria-labelledby="profile-photo-title">
              <span className={styles.index}>02&nbsp; SAY CHEESE</span>
              <h2 id="profile-photo-title">Your profile photo</h2>

              <div className={styles.photoIdentity}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    width={96}
                    height={96}
                    unoptimized
                    alt="Your profile photo"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={`${styles.avatar} ${styles.avatarFallback}`}>
                    {initials}
                  </div>
                )}
                <div className={styles.identityCopy}>
                  <strong>{displayName || "Your profile"}</strong>
                  <span className={styles.hint}>A little face for your account.</span>
                </div>
              </div>

              <form action="/profile/avatar" method="post" encType="multipart/form-data" className={styles.uploadForm}>
                <label className={styles.fileLabel}>
                  <span className={styles.visuallyHidden}>Choose a photo</span>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    aria-label="Choose a photo"
                    className={styles.fileInput}
                  />
                </label>
                <p className={`${styles.hint} ${styles.photoNote}`}>
                  JPEG, PNG, or WebP · Up to 2 MB<br />
                  Your photo is publicly viewable.
                </p>
                <button className={`button-primary ${styles.uploadButton}`} type="submit">Upload photo <span aria-hidden="true">→</span></button>
              </form>

              {avatar === "saved" && <p role="status" className={styles.successMessage}>Photo updated.</p>}
              {avatar === "invalid" && <p role="alert" className={styles.errorMessage}>Choose a valid image under 2 MB.</p>}
              {avatar === "error" && <p role="alert" className={styles.errorMessage}>Could not upload your photo. Please try again.</p>}

              <span className={styles.catSticker} aria-hidden="true" />
            </section>
          </div>

          <footer className={styles.footer}>
            <span aria-hidden="true">✦</span> CAMPUS AFTER HOURS
            <span aria-hidden="true">✦</span> THE HUMOR PROJECT
          </footer>
        </div>
      </div>
    </main>
  );
}
