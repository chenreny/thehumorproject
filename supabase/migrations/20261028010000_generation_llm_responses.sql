-- Save raw Responses API output and timing for future generations. User-facing
-- generation history remains in generation_requests/captions; this table is
-- only readable and writable through the server-only service role.
create table if not exists public.generation_llm_responses (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generation_requests(id) on delete cascade,
  model text not null,
  status text not null check (status in ('completed', 'failed')),
  response_text text,
  error_message text,
  processing_time_ms integer check (processing_time_ms is null or processing_time_ms >= 0),
  created_at timestamptz not null default now(),
  created_by_user_id uuid references public.profiles(id),
  constraint generation_llm_responses_result_check check (
    (status = 'completed' and response_text is not null and error_message is null)
    or (status = 'failed' and error_message is not null)
  )
);

create index if not exists generation_llm_responses_generation_created
  on public.generation_llm_responses (generation_id, created_at desc);

alter table public.generation_llm_responses enable row level security;
revoke all on public.generation_llm_responses from public, anon, authenticated;
grant all on public.generation_llm_responses to service_role;
