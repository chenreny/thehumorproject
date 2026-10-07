-- Run with: npx supabase db query --linked --file supabase/tests/ai_permissions.sql
-- All fixtures are rolled back, including Auth users and their generated profiles.
begin;
insert into auth.users (id, email) values
 ('10000000-0000-4000-8000-000000000001', 'rls-test-one@example.invalid'),
 ('10000000-0000-4000-8000-000000000002', 'rls-test-two@example.invalid');
insert into public.generation_requests (id, user_id, prompt, system_prompt, topic, model, status) values
 ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'A private test scene', 'Test instruction', 'Campus', 'test', 'completed');
insert into public.captions (id, generation_id, setup, punchline, topic) values
 ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Test setup', 'Test punchline', 'Campus');

set local role anon;
do $$ begin
 begin
  perform * from public.caption_feed('new', 0, '30000000-0000-4000-8000-000000000001');
  raise exception 'Guest read feed';
 exception when insufficient_privilege then null; end;
 begin
  perform * from public.captions;
  raise exception 'Guest read captions directly';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.caption_votes (caption_id, user_id, value) values ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 1);
  raise exception 'Guest vote was allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform * from public.generation_requests;
  raise exception 'Guest read private prompts';
 exception when insufficient_privilege then null; end;
 begin
  perform * from public.caption_votes;
  raise exception 'Guest read voter identities';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
insert into public.caption_votes (caption_id, value) values ('30000000-0000-4000-8000-000000000001', 1);
do $$ begin
 assert (select count(*) = 1 from public.generation_requests), 'Owner cannot read prompt';
 assert (select count(*) = 1 from public.caption_votes), 'Owner cannot read own vote';
 begin
  insert into public.caption_votes (caption_id, value) values ('30000000-0000-4000-8000-000000000001', -1);
  raise exception 'Duplicate vote was allowed';
 exception when unique_violation then null; end;
 begin
  insert into public.caption_votes (caption_id, user_id, value) values ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 1);
  raise exception 'Forged voter was allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.caption_votes set value = 0;
  raise exception 'Invalid vote was allowed';
 exception when check_violation then null; end;
 begin
  update public.caption_votes set user_id = '10000000-0000-4000-8000-000000000002';
  raise exception 'Vote ownership transfer was allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.reserve_generation('10000000-0000-4000-8000-000000000001', 'A forged request', 'Test', 'Campus', 'test');
  raise exception 'Client bypassed generation server';
 exception when insufficient_privilege then null; end;
 begin
  perform public.complete_generation('20000000-0000-4000-8000-000000000001', 'Forged setup', 'Forged result');
  raise exception 'Client published forged AI output';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.captions (generation_id, setup, punchline, topic) values ('20000000-0000-4000-8000-000000000001', 'Forged setup', 'Forged result', 'Campus');
  raise exception 'Client directly inserted AI output';
 exception when insufficient_privilege then null; end;
end $$;
update public.caption_votes set value = -1 where caption_id = '30000000-0000-4000-8000-000000000001';
do $$ begin
 assert (select score = -1 and votes = 1 from public.caption_feed('new', 0, '30000000-0000-4000-8000-000000000001')), 'Changing a vote did not preserve one vote';
end $$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ declare changed integer; begin
 assert (select count(*) = 0 from public.generation_requests), 'Another user read private prompt';
 assert (select count(*) = 0 from public.caption_votes), 'Another user read a private vote';
 assert not exists (select 1 from public.profiles where id = '10000000-0000-4000-8000-000000000001'), 'Another user read profile';
 update public.caption_votes set value = 1 where user_id = '10000000-0000-4000-8000-000000000001';
 get diagnostics changed = row_count;
 assert changed = 0, 'Another user changed a private vote';
end $$;
insert into public.caption_votes (caption_id, value) values ('30000000-0000-4000-8000-000000000001', 1);
do $$ begin
 assert (select score = 0 and votes = 2 from public.caption_feed('new', 0, '30000000-0000-4000-8000-000000000001')), 'Public aggregate does not include all users';
end $$;
reset role;

-- Verify the database enforces the limit, persistence, and atomic publication.
do $$ declare request_id uuid; published_id uuid; begin
 for i in 1..5 loop
  request_id := public.reserve_generation('10000000-0000-4000-8000-000000000002', 'Another private scene', 'Exact system prompt', 'NYC', 'test-model');
 end loop;
 begin
  perform public.reserve_generation('10000000-0000-4000-8000-000000000002', 'The sixth request', 'Test', 'Campus', 'test');
  raise exception 'Limit was not enforced';
 exception when raise_exception then
  if sqlerrm <> 'GENERATION_LIMIT' then raise; end if;
 end;
 begin
  perform public.complete_generation(request_id, '', 'Invalid empty setup');
  raise exception 'Invalid caption was published';
 exception when check_violation then null; end;
 assert (select status = 'pending' from public.generation_requests where id = request_id), 'Failed publication changed status';
 published_id := public.complete_generation(request_id, 'A valid setup', 'A valid punchline');
 assert exists (select 1 from public.captions where id = published_id), 'Result was not persisted';
 assert (select status = 'completed' and system_prompt = 'Exact system prompt' and prompt = 'Another private scene' and model = 'test-model' from public.generation_requests where id = request_id), 'Generation provenance was not saved';
 begin
  perform public.complete_generation(request_id, 'Duplicate setup', 'Duplicate result');
  raise exception 'Completed request published twice';
 exception when raise_exception then
  if sqlerrm <> 'INVALID_REQUEST' then raise; end if;
 end;
 assert not exists (select 1 from pg_tables where schemaname in ('public', 'storage') and not rowsecurity), 'Application table has RLS disabled';
end $$;
rollback;
select 'PASS: guest restrictions, owner isolation, vote constraints, aggregates, rate limits, atomic publication, and RLS' as result;
