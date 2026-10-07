begin;
insert into auth.users(id, email) values
 ('10000000-0000-4000-8000-000000000003', 'image-owner@example.invalid'),
 ('10000000-0000-4000-8000-000000000004', 'image-other@example.invalid');
insert into public.generation_requests(id, user_id, prompt, system_prompt, topic, model, image_path) values
 ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Test image scene', 'Test image instruction', 'Campus', 'test', '10000000-0000-4000-8000-000000000003/20000000-0000-4000-8000-000000000003.jpg');
-- Metadata-only fixture; all changes roll back and no binary is uploaded.
insert into storage.objects(bucket_id, name) values
 ('meme-images', '10000000-0000-4000-8000-000000000003/20000000-0000-4000-8000-000000000003.jpg');
set local role anon;
do $$ begin
 assert not exists(select 1 from storage.objects where bucket_id = 'meme-images' and name like '10000000-0000-4000-8000-000000000003/%'), 'Guest read unpublished image';
 assert not has_function_privilege('anon', 'public.complete_meme_generation(uuid,text,text,text)', 'execute'), 'Guest can publish memes';
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
do $$ begin
 assert not exists(select 1 from storage.objects where bucket_id = 'meme-images' and name like '10000000-0000-4000-8000-000000000003/%'), 'Another user read unpublished image';
 assert not has_function_privilege('authenticated', 'public.complete_meme_generation(uuid,text,text,text)', 'execute'), 'Client can publish memes';
 begin
  insert into storage.objects(bucket_id, name) values ('meme-images', '10000000-0000-4000-8000-000000000004/forged.jpg');
  raise exception 'Client bypassed upload server';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
do $$ begin
 assert exists(select 1 from storage.objects where bucket_id = 'meme-images' and name like '10000000-0000-4000-8000-000000000003/%'), 'Owner cannot read own pending image';
end $$;
reset role;
do $$ declare result_id uuid; begin
 assert (select not public from storage.buckets where id = 'meme-images'), 'Meme bucket is not private';
 begin
  perform public.complete_meme_generation('20000000-0000-4000-8000-000000000003', repeat('a', 81), 'Bottom', 'An image');
  raise exception 'Oversized caption was allowed';
 exception when raise_exception then if sqlerrm <> 'INVALID_CAPTION' then raise; end if; end;
 result_id := public.complete_meme_generation('20000000-0000-4000-8000-000000000003', 'Top caption', 'Bottom caption', 'A test image description');
 assert exists(select 1 from public.captions where id = result_id and image_path is not null and image_description = 'A test image description'), 'Image provenance not saved';
end $$;
set local role anon;
do $$ begin
 assert not exists(select 1 from storage.objects where bucket_id = 'meme-images' and name like '10000000-0000-4000-8000-000000000003/%'), 'Guest read published image';
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
do $$ begin
 assert exists(select 1 from storage.objects where bucket_id = 'meme-images' and name like '10000000-0000-4000-8000-000000000003/%'), 'Member cannot read published image';
end $$;
reset role;
rollback;
select 'PASS: private bucket, owner access, member access after publication, guest denial, server-only uploads and publication, caption bounds' as result;
