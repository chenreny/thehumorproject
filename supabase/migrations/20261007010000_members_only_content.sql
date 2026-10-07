-- Content reads require a session, including direct database and Storage access.
revoke all on public.captions, public.jokes from anon;
revoke execute on function public.caption_feed(text, integer, uuid) from anon;

alter policy "Everyone reads generated captions" on public.captions to authenticated;
drop policy if exists "Anyone can read jokes" on public.jokes;
alter policy "Published meme images are readable" on storage.objects to authenticated;
