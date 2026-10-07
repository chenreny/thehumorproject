-- Source provenance is private alongside the original prompt. Existing RLS and
-- server-only write grants on generation_requests remain in force.
alter table public.generation_requests add column template_id text;
alter table public.generation_requests add constraint generation_requests_template_id_check
  check (template_id is null or template_id in (
    'surprised-pikachu', 'this-is-fine', 'monkey-puppet', 'disaster-girl',
    'waiting-skeleton', 'hide-the-pain-harold', 'woman-yelling-at-cat', 'one-does-not-simply'
  ));
