import { safeAuthDestination } from "@/lib/auth-redirect";
import { Icon } from "@/components/icon";

export function SignInScreen({ next, authError }: { next?: string; authError?: string }) {
  const destination = safeAuthDestination(next, "/");
  return <main className="page-shell flex min-h-screen items-center justify-center">
    <section className="panel mx-auto w-full max-w-md p-8 text-center sm:p-10">
      <Icon name="spark" className="mx-auto mb-6 !size-8 text-accent" />
      <p className="eyebrow mb-4">The Humor Project</p>
      <h1 className="text-3xl font-semibold tracking-tight">Sign in to continue</h1>
      <p className="mt-4 text-sm leading-relaxed text-accent">Your campus meme corner is for members.</p>
      {authError && <p role="alert" className="mt-5 text-sm text-accent-strong">Sign in could not be completed. Please try again.</p>}
      <a href={`/auth/login?next=${encodeURIComponent(destination)}`} className="button-primary mt-7 w-full" aria-label="Sign in with Google">Continue with Google</a>
    </section>
  </main>;
}
