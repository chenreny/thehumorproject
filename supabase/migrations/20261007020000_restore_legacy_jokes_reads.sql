-- Older deployments read legacy jokes with the anonymous Supabase client.
-- Keep that read contract while the current app gates its pages with sign-in.
alter table public.jokes enable row level security;
grant usage on schema public to anon;
grant select on public.jokes to anon, authenticated;

drop policy if exists "Anyone can read jokes" on public.jokes;
create policy "Anyone can read jokes" on public.jokes
for select to anon using (true);
