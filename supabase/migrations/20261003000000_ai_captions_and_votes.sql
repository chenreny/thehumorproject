-- Requests and prompts are private. Only verified server-generated captions are public.
create table public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 10 and 500),
  system_prompt text not null,
  topic text not null check (topic in ('Campus', 'NYC', 'Dorm life')),
  model text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);
create index generation_requests_user_created on public.generation_requests(user_id, created_at desc);

create table public.captions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null unique references public.generation_requests(id) on delete cascade,
  setup text not null check (char_length(setup) between 1 and 240),
  punchline text not null check (char_length(punchline) between 1 and 300),
  topic text not null check (topic in ('Campus', 'NYC', 'Dorm life')),
  created_at timestamptz not null default now()
);
create index captions_created on public.captions(created_at desc);
create table public.caption_votes (
  caption_id uuid not null references public.captions(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (caption_id, user_id)
);
create index caption_votes_user on public.caption_votes(user_id);

alter table public.generation_requests enable row level security;
alter table public.captions enable row level security;
alter table public.caption_votes enable row level security;
revoke all on public.generation_requests, public.captions, public.caption_votes from anon, authenticated;
grant select on public.generation_requests to authenticated;
grant select on public.captions to anon, authenticated;
grant select, insert on public.caption_votes to authenticated;
grant update (value) on public.caption_votes to authenticated;
grant all on public.generation_requests, public.captions, public.caption_votes to service_role;

create policy "Owners read their generation history" on public.generation_requests
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Everyone reads generated captions" on public.captions
for select to anon, authenticated using (true);
create policy "Owners read their votes" on public.caption_votes
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners insert votes" on public.caption_votes
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners change their vote" on public.caption_votes
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Called only by the server after getUser(). A lock prevents concurrent requests
-- from exceeding the limit. Failed attempts count to bound provider costs.
create function public.reserve_generation(p_user_id uuid, p_prompt text, p_system_prompt text, p_topic text, p_model text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare request_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if (select count(*) from public.generation_requests where user_id = p_user_id
      and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'GENERATION_LIMIT';
  end if;
  insert into public.generation_requests(user_id, prompt, system_prompt, topic, model)
  values (p_user_id, p_prompt, p_system_prompt, p_topic, p_model) returning id into request_id;
  return request_id;
end;
$$;
revoke all on function public.reserve_generation(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.reserve_generation(uuid, text, text, text, text) to service_role;

-- Atomically publish the result and complete the request.
create function public.complete_generation(p_request_id uuid, p_setup text, p_punchline text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare request_topic text; caption_id uuid;
begin
  select topic into request_topic from public.generation_requests
    where id = p_request_id and status = 'pending' for update;
  if not found then raise exception 'INVALID_REQUEST'; end if;
  insert into public.captions(generation_id, setup, punchline, topic)
  values (p_request_id, p_setup, p_punchline, request_topic) returning id into caption_id;
  update public.generation_requests set status = 'completed' where id = p_request_id;
  return caption_id;
end;
$$;
revoke all on function public.complete_generation(uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_generation(uuid, text, text) to service_role;

-- Expose only aggregate scores, never voter identities. Bound paging to 30 rows.
create function public.caption_feed(p_sort text default 'new', p_offset integer default 0, p_id uuid default null)
returns table (id uuid, setup text, punchline text, topic text, created_at timestamptz, score bigint, votes bigint)
language sql stable security definer set search_path = '' as $$
  select c.id, c.setup, c.punchline, c.topic, c.created_at,
    coalesce(sum(v.value), 0)::bigint as score, count(v.value) as votes
  from public.captions c left join public.caption_votes v on v.caption_id = c.id
  where (p_id is null or c.id = p_id)
    and (p_sort <> 'week' or c.created_at >= now() - interval '7 days')
  group by c.id
  order by case when p_sort = 'week' then coalesce(sum(v.value), 0) end desc,
    c.created_at desc, c.id
  limit 30 offset greatest(0, least(coalesce(p_offset, 0), 30000));
$$;
revoke all on function public.caption_feed(text, integer, uuid) from public;
grant execute on function public.caption_feed(text, integer, uuid) to anon, authenticated;

-- Tighten existing tables while preserving the original read/profile workflows.
revoke all on public.jokes from anon, authenticated;
grant select on public.jokes to anon, authenticated;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, last_name, avatar_path, updated_at) on public.profiles to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Default-deny every existing application table without touching Supabase-managed schemas.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
