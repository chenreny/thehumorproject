export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-6 text-zinc-950">
      <section className="w-full max-w-3xl rounded-[2rem] border-4 border-zinc-950 bg-yellow-300 p-8 shadow-[10px_10px_0_0_#18181b] sm:p-14">
        <p className="mb-6 text-sm font-bold uppercase tracking-[0.25em]">
          Freshly deployed
        </p>
        <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
          The Humor Project
        </h1>
        <p className="mt-8 max-w-xl text-xl font-medium leading-relaxed sm:text-2xl">
          Why did the developer go broke? Because they used up all their cache.
        </p>
        <div className="mt-10 inline-flex rotate-[-2deg] rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white">
          More laughs coming soon
        </div>
      </section>
    </main>
  );
}
