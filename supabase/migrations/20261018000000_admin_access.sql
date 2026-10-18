-- Admin access is granted explicitly in the database after a Google sign-in.
-- Existing profile edit permissions name their writable columns and do not
-- include this flag, so users cannot promote themselves through the client.
alter table public.profiles
  add column is_superadmin boolean not null default false;

revoke update (is_superadmin) on public.profiles from anon, authenticated;

create index profiles_superadmins on public.profiles (id) where is_superadmin;
