-- A participant may send study reminders to a different address from their
-- Google sign-in email. NULL keeps the confirmed sign-in address as the default.
alter table public.profiles
  add column notification_email text
  constraint profiles_notification_email_valid check (
    notification_email is null or (
      char_length(notification_email) <= 254
      and notification_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  );

comment on column public.profiles.notification_email is
  'Optional destination for opted-in study email reminders. NULL uses the confirmed Auth sign-in email.';

-- The private queue and delivery workers already use this function for
-- eligibility and recheck its destination before each send. A changed address
-- therefore cancels a queued reminder to the previous address.
create or replace function funnystudy_notifications.email_recipients(at_time timestamptz)
returns table (profile_id uuid, email text, first_name text)
language sql stable security invoker set search_path = '' as $$
  select p.id, coalesce(p.notification_email, u.email), p.first_name
  from public.profiles p join auth.users u on u.id = p.id
  where p.notify_new_study_email
    and u.email_confirmed_at is not null
    and coalesce(p.notification_email, u.email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and exists (
      select 1 from public.studies s
      where s.is_private = false
        and (s.start_datetime_utc is null or s.start_datetime_utc <= at_time)
        and (s.end_datetime_utc is null or s.end_datetime_utc >= at_time)
        and not exists (
          select 1 from public.study_participations participation
          where participation.profile_id = p.id and participation.study_id = s.id
            and participation.started_at is not null and participation.ended_at is not null
        )
    );
$$;

revoke all on function funnystudy_notifications.email_recipients(timestamptz)
  from public, anon, authenticated;
