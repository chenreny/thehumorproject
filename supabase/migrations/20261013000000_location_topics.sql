-- New generations use their actual location. Keep accepting legacy values so existing requests and captions remain valid.
alter table public.generation_requests
  drop constraint if exists generation_requests_topic_check;
alter table public.generation_requests
  add constraint generation_requests_topic_check
  check (topic in ('Campus', 'Ktown', 'EastVillage', 'NYC', 'Dorm life'));

alter table public.captions
  drop constraint if exists captions_topic_check;
alter table public.captions
  add constraint captions_topic_check
  check (topic in ('Campus', 'Ktown', 'EastVillage', 'NYC', 'Dorm life'));
