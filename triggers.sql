
-- Trigger to maintain vote count intrinsically
create or replace function public.update_student_votes()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.students set votes = votes + 1 where id = new.student_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.students set votes = votes - 1 where id = old.student_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_vote_change on public.votes;
create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute procedure public.update_student_votes();
