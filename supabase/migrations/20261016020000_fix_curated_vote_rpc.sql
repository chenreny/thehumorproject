create or replace function public.vote_curated_meme(p_sample_id text, p_value smallint)
returns table (sample_id text, my_vote smallint, upvotes bigint)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  voter_id uuid := auth.uid();
  current_vote smallint;
begin
  if voter_id is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_sample_id is null or p_sample_id not in (
    'campus-food-midnight', 'campus-all-dorm', 'campus-study-harold', 'campus-dorm-disaster',
    'campus-study-impossible', 'ktown-food-bakery', 'ktown-karaoke-encore', 'east-food-dumplings',
    'east-clubs-live', 'east-clubs-dj', 'east-all-sidequest', 'east-all-walk',
    'east-cheap-harold', 'east-music-disaster'
  ) then raise exception 'INVALID_SAMPLE'; end if;
  if p_value is null or p_value not in (-1, 1) then raise exception 'INVALID_VOTE'; end if;

  perform pg_advisory_xact_lock(hashtextextended(voter_id::text || ':' || p_sample_id, 0));
  select vote_row.value into current_vote
    from public.curated_meme_votes as vote_row
    where vote_row.sample_id = p_sample_id and vote_row.user_id = voter_id for update;

  if current_vote = p_value then
    delete from public.curated_meme_votes as vote_row
      where vote_row.sample_id = p_sample_id and vote_row.user_id = voter_id;
  else
    insert into public.curated_meme_votes(sample_id, user_id, value)
      values (p_sample_id, voter_id, p_value)
      on conflict on constraint curated_meme_votes_pkey do update set value = excluded.value;
  end if;

  return query select p_sample_id,
    (select vote_row.value from public.curated_meme_votes as vote_row where vote_row.sample_id = p_sample_id and vote_row.user_id = voter_id),
    count(*) filter (where vote_row.value = 1)::bigint
  from public.curated_meme_votes as vote_row where vote_row.sample_id = p_sample_id;
end;
$$;
