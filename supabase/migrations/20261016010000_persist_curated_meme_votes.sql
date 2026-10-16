create table public.curated_meme_votes (
  sample_id text not null check (sample_id in (
    'campus-food-midnight', 'campus-all-dorm', 'campus-study-harold', 'campus-dorm-disaster',
    'campus-study-impossible', 'ktown-food-bakery', 'ktown-karaoke-encore', 'east-food-dumplings',
    'east-clubs-live', 'east-clubs-dj', 'east-all-sidequest', 'east-all-walk',
    'east-cheap-harold', 'east-music-disaster'
  )),
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (sample_id, user_id)
);

alter table public.curated_meme_votes enable row level security;
revoke all on public.curated_meme_votes from public, anon, authenticated;

create function public.get_curated_meme_votes()
returns table (sample_id text, my_vote smallint, upvotes bigint)
language sql stable security definer set search_path = '' as $$
  with sample_ids(sample_id) as (values
    ('campus-food-midnight'), ('campus-all-dorm'), ('campus-study-harold'), ('campus-dorm-disaster'),
    ('campus-study-impossible'), ('ktown-food-bakery'), ('ktown-karaoke-encore'), ('east-food-dumplings'),
    ('east-clubs-live'), ('east-clubs-dj'), ('east-all-sidequest'), ('east-all-walk'),
    ('east-cheap-harold'), ('east-music-disaster')
  )
  select s.sample_id,
    max(v.value) filter (where v.user_id = auth.uid())::smallint as my_vote,
    count(*) filter (where v.value = 1)::bigint as upvotes
  from sample_ids s
  left join public.curated_meme_votes v on v.sample_id = s.sample_id
  group by s.sample_id
  order by s.sample_id;
$$;
revoke all on function public.get_curated_meme_votes() from public, anon;
grant execute on function public.get_curated_meme_votes() to authenticated;

create function public.vote_curated_meme(p_sample_id text, p_value smallint)
returns table (sample_id text, my_vote smallint, upvotes bigint)
language plpgsql security definer set search_path = '' as $$
declare
  voter_id uuid := auth.uid();
  current_vote smallint;
begin
  if voter_id is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_value not in (-1, 1) then raise exception 'INVALID_VOTE'; end if;

  perform pg_advisory_xact_lock(hashtextextended(voter_id::text || ':' || p_sample_id, 0));
  select value into current_vote from public.curated_meme_votes
    where curated_meme_votes.sample_id = p_sample_id and user_id = voter_id for update;

  if current_vote = p_value then
    delete from public.curated_meme_votes
      where curated_meme_votes.sample_id = p_sample_id and user_id = voter_id;
  else
    insert into public.curated_meme_votes(sample_id, user_id, value)
      values (p_sample_id, voter_id, p_value)
      on conflict (sample_id, user_id) do update set value = excluded.value;
  end if;

  return query select p_sample_id,
    (select value from public.curated_meme_votes where curated_meme_votes.sample_id = p_sample_id and user_id = voter_id),
    count(*) filter (where value = 1)::bigint
  from public.curated_meme_votes where curated_meme_votes.sample_id = p_sample_id;
end;
$$;
revoke all on function public.vote_curated_meme(text, smallint) from public, anon;
grant execute on function public.vote_curated_meme(text, smallint) to authenticated;
