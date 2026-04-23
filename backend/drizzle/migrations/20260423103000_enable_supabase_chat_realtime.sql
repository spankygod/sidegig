create or replace function public.touch_chat_thread_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_threads
  set updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists set_chat_thread_activity_on_message on public.chat_messages;
create trigger set_chat_thread_activity_on_message
after insert on public.chat_messages
for each row execute procedure public.touch_chat_thread_on_message();

do $$
begin
  begin
    alter publication supabase_realtime add table public.chat_threads;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.chat_messages;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;
