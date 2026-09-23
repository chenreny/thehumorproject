import { connection } from "next/server";
import { getJokes } from "@/lib/supabase";

export default async function Home() {
  await connection();
  const jokes = await getJokes();

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-16 text-zinc-950 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
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
