-- Keep existing text jokes and votes while new creations use uploaded photos.
alter table public.generation_requests add column image_path text;
alter table public.captions add column image_path text;
alter table public.captions add column image_description text
  check (image_description is null or char_length(image_description) between 1 and 300);
create unique index captions_image_path on public.captions(image_path) where image_path is not null;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('meme-images', 'meme-images', false, 3145728, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Only the server uploads normalized images, after auth and rate-limit checks.
-- Failed/unpublished uploads are private; a caption makes its image readable.
create policy "Published meme images are readable" on storage.objects
for select to anon, authenticated using (
  bucket_id = 'meme-images' and exists (
    select 1 from public.captions c where c.image_path = name
  )
);
create policy "Owners can read their pending meme image" on storage.objects
for select to authenticated using (
  bucket_id = 'meme-images' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create function public.complete_meme_generation(p_request_id uuid, p_setup text, p_punchline text, p_image_description text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare req public.generation_requests; result_id uuid;
begin
  select * into req from public.generation_requests where id = p_request_id and status = 'pending' for update;
  if not found or req.image_path is null then raise exception 'INVALID_REQUEST'; end if;
  if req.image_path <> req.user_id::text || '/' || req.id::text || '.jpg'
    or not exists (select 1 from storage.objects where bucket_id = 'meme-images' and name = req.image_path)
    then raise exception 'INVALID_IMAGE'; end if;
  if char_length(p_setup) not between 1 and 80 or char_length(p_punchline) not between 1 and 100
    or p_image_description is null or char_length(p_image_description) not between 1 and 300
    then raise exception 'INVALID_CAPTION'; end if;
  insert into public.captions(generation_id, setup, punchline, topic, image_path, image_description)
    values (req.id, p_setup, p_punchline, req.topic, req.image_path, p_image_description) returning id into result_id;
  update public.generation_requests set status = 'completed' where id = req.id;
  return result_id;
end;
$$;
revoke all on function public.complete_meme_generation(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.complete_meme_generation(uuid, text, text, text) to service_role;

-- Return image references alongside existing fields. Previous deployments can
-- still consume their original fields while the new deployment is building.
drop function public.caption_feed(text, integer, uuid);
create function public.caption_feed(p_sort text default 'new', p_offset integer default 0, p_id uuid default null)
returns table (id uuid, setup text, punchline text, topic text, created_at timestamptz, score bigint, votes bigint, image_path text, image_description text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.setup, c.punchline, c.topic, c.created_at,
    coalesce(sum(v.value), 0)::bigint as score, count(v.value) as votes, c.image_path, c.image_description
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
