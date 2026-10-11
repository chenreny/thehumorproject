-- Raise the rolling per-user generation limit from five requests to ten.
create or replace function public.reserve_generation(p_user_id uuid, p_prompt text, p_system_prompt text, p_topic text, p_model text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare request_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if (select count(*) from public.generation_requests where user_id = p_user_id
      and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'GENERATION_LIMIT';
  end if;
  insert into public.generation_requests(user_id, prompt, system_prompt, topic, model)
  values (p_user_id, p_prompt, p_system_prompt, p_topic, p_model) returning id into request_id;
  return request_id;
end;
$$;
revoke all on function public.reserve_generation(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.reserve_generation(uuid, text, text, text, text) to service_role;
