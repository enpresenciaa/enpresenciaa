create table public.levels (
  id uuid primary key default gen_random_uuid(),
  number smallint not null unique check (number > 0),
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels (id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 140),
  content_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level_id, name)
);

create table public.exercise_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  progress_percentage smallint not null default 0 check (progress_percentage between 0 and 100),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  idempotency_key uuid not null,
  repetition_number integer not null check (repetition_number > 0),
  completed_at timestamptz not null default now(),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  emotional_score smallint check (emotional_score is null or emotional_score between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  unique (user_id, exercise_id, repetition_number)
);

create index exercise_progress_user_activity_idx
on public.exercise_progress (user_id, last_activity_at desc);

create index exercise_progress_user_percentage_idx
on public.exercise_progress (user_id, progress_percentage, last_activity_at desc);

create index exercise_completions_user_completed_idx
on public.exercise_completions (user_id, completed_at desc);

create index exercise_completions_user_exercise_idx
on public.exercise_completions (user_id, exercise_id, completed_at desc);

alter table public.levels enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_progress enable row level security;
alter table public.exercise_completions enable row level security;

revoke all on public.levels, public.exercises, public.exercise_progress, public.exercise_completions from anon;
grant select on public.levels, public.exercises to authenticated;
grant select, insert, update on public.exercise_progress to authenticated;
grant select on public.exercise_completions to authenticated;
grant all on public.levels, public.exercises, public.exercise_progress, public.exercise_completions to service_role;

create function public.set_journal_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_journal_updated_at() from public, anon, authenticated;

create trigger set_levels_updated_at
before update on public.levels
for each row execute procedure public.set_journal_updated_at();

create trigger set_exercises_updated_at
before update on public.exercises
for each row execute procedure public.set_journal_updated_at();

create trigger set_exercise_progress_updated_at
before update on public.exercise_progress
for each row execute procedure public.set_journal_updated_at();

create policy "Authenticated users can read levels"
on public.levels for select to authenticated using (true);

create policy "Authenticated users can read exercises"
on public.exercises for select to authenticated using (true);

create policy "Users can read their own exercise progress"
on public.exercise_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own exercise progress"
on public.exercise_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own exercise progress"
on public.exercise_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read their own exercise completions"
on public.exercise_completions for select to authenticated
using ((select auth.uid()) = user_id);

create function public.complete_exercise(
  p_exercise_id uuid,
  p_idempotency_key uuid,
  p_completed_at timestamptz default now(),
  p_duration_seconds integer default null,
  p_emotional_score smallint default null
)
returns public.exercise_completions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_completion public.exercise_completions;
  next_repetition integer;
  result public.exercise_completions;
begin
  if current_user_id is null then
    raise exception 'AUTH_SESSION_REQUIRED';
  end if;

  if p_duration_seconds is not null and p_duration_seconds < 0 then
    raise exception 'INVALID_DURATION';
  end if;

  if p_emotional_score is not null and p_emotional_score not between 1 and 5 then
    raise exception 'INVALID_EMOTIONAL_SCORE';
  end if;

  select * into existing_completion
  from public.exercise_completions
  where user_id = current_user_id and idempotency_key = p_idempotency_key;

  if found then
    return existing_completion;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || p_exercise_id::text, 0));

  select * into existing_completion
  from public.exercise_completions
  where user_id = current_user_id and idempotency_key = p_idempotency_key;

  if found then
    return existing_completion;
  end if;

  select coalesce(max(repetition_number), 0) + 1 into next_repetition
  from public.exercise_completions
  where user_id = current_user_id and exercise_id = p_exercise_id;

  insert into public.exercise_completions (
    user_id, exercise_id, idempotency_key, repetition_number,
    completed_at, duration_seconds, emotional_score
  ) values (
    current_user_id, p_exercise_id, p_idempotency_key, next_repetition,
    p_completed_at, p_duration_seconds, p_emotional_score
  )
  returning * into result;

  insert into public.exercise_progress (
    user_id, exercise_id, progress_percentage, last_activity_at
  ) values (
    current_user_id, p_exercise_id, 100, p_completed_at
  )
  on conflict (user_id, exercise_id) do update set
    progress_percentage = 100,
    last_activity_at = excluded.last_activity_at,
    updated_at = now();

  return result;
end;
$$;

revoke all on function public.complete_exercise(uuid, uuid, timestamptz, integer, smallint) from public, anon;
grant execute on function public.complete_exercise(uuid, uuid, timestamptz, integer, smallint) to authenticated;

create view public.journal_entries
with (security_invoker = true)
as
select
  'progress:' || progress.exercise_id::text as entry_id,
  progress.user_id,
  levels.name as level_name,
  exercises.name as exercise_name,
  progress.progress_percentage,
  progress.last_activity_at as activity_at,
  null::timestamptz as completed_at,
  null::integer as duration_seconds,
  exercises.content_type,
  null::integer as repetition_number,
  null::smallint as emotional_score
from public.exercise_progress as progress
join public.exercises on exercises.id = progress.exercise_id
join public.levels on levels.id = exercises.level_id
where progress.progress_percentage < 100
union all
select
  'completion:' || completions.id::text as entry_id,
  completions.user_id,
  levels.name as level_name,
  exercises.name as exercise_name,
  100::smallint as progress_percentage,
  completions.completed_at as activity_at,
  completions.completed_at,
  completions.duration_seconds,
  exercises.content_type,
  completions.repetition_number,
  completions.emotional_score
from public.exercise_completions as completions
join public.exercises on exercises.id = completions.exercise_id
join public.levels on levels.id = exercises.level_id;

revoke all on public.journal_entries from anon;
grant select on public.journal_entries to authenticated;

comment on view public.journal_entries is
'RLS-protected read model for partial progress and immutable exercise completion history.';
