import { safeAuthDestination } from "@/lib/auth-redirect";
import { Icon } from "@/components/icon";
import styles from "./sign-in-screen.module.css";

export function SignInScreen({ next, authError }: { next?: string; authError?: string }) {
  const destination = safeAuthDestination(next, "/");
  return <main className={styles.page}>
    <section className={styles.card}>
      <Icon name="spark" className={styles.icon} />
      <p className={styles.eyebrow}>The Humor Project</p>
      <h1 className={styles.title}>Sign in to continue</h1>
      <p className={styles.description}>Your campus meme corner is for members.</p>
      {authError && <p role="alert" className={styles.error}>Sign in could not be completed. Please try again.</p>}
      <a href={`/auth/login?next=${encodeURIComponent(destination)}`} className={styles.signIn} aria-label="Sign in with Google">Continue with Google</a>
    </section>
  </main>;
}
