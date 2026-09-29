import { connection } from "next/server";
import { getJokes } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home({ searchParams }: { searchParams: Promise<{ auth_error?: string }> }) {
  await connection();
  const supabase = await createClient();
  const [{ data: { user } }, jokes] = await Promise.all([supabase.auth.getUser(), getJokes()]);
  const { auth_error: authError } = await searchParams;

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-16 text-zinc-950 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-4 font-bold">
          <span>The Humor Project</span>
          {user ? (
            <div className="flex items-center gap-5">
              <Link href="/members" className="underline">Members</Link>
              <Link href="/profile" className="underline">Profile</Link>
              <form action="/auth/logout" method="post"><button className="underline">Sign out</button></form>
            </div>
          ) : (
            <a href="/auth/login" className="rounded-xl bg-zinc-950 px-5 py-3 text-white">Continue with Google</a>
          )}
        </nav>
        {authError && <p role="alert" className="mb-8 rounded-xl border-2 border-red-800 bg-white p-4 font-bold text-red-800">Sign in could not be completed. Please try again.</p>}
        <header className="mb-12">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em]">
            Live from Supabase
          </p>
          <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
            The Humor Project
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium text-zinc-700 sm:text-xl">
            A database-backed collection of developer jokes, fetched fresh for
            every visit.
          </p>
          {user && <p className="mt-4 font-bold">Signed in as {user.email}</p>}
        </header>

        <ul className="grid gap-6 md:grid-cols-2">
          {jokes.map((joke, index) => (
            <li
              key={joke.id}
              className={`rounded-[2rem] border-4 border-zinc-950 p-7 shadow-[8px_8px_0_0_#18181b] ${
                index % 2 === 0 ? "bg-yellow-300" : "bg-rose-300"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-widest">
                Joke {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-5 text-2xl font-black leading-tight">
                {joke.setup}
              </h2>
              <p className="mt-4 text-lg font-medium leading-relaxed">
                {joke.punchline}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
