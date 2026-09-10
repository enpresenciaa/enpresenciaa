begin;

alter table public.exercises
  add column guide_phrase text,
  add column instructions text,
  add constraint exercises_content_type_check
    check (content_type is null or content_type in ('audio', 'video', 'text')),
  add constraint exercises_guide_phrase_check
    check (guide_phrase is null or char_length(trim(guide_phrase)) between 1 and 280),
  add constraint exercises_instructions_check
    check (instructions is null or char_length(trim(instructions)) between 1 and 5000);

alter table public.completion_reflections
  drop constraint if exists completion_reflections_reflection_text_check,
  add constraint completion_reflections_reflection_text_check
    check (char_length(trim(reflection_text)) between 1 and 150);

create table public.initial_exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idempotency_key uuid not null,
  emotional_score smallint not null check (emotional_score between 1 and 5),
  reflection_text text not null
    check (char_length(trim(reflection_text)) between 1 and 150),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (user_id, idempotency_key)
);

alter table public.initial_exercise_completions enable row level security;

revoke all on public.initial_exercise_completions from public, anon, authenticated;
grant select on public.initial_exercise_completions to authenticated;
grant all on public.initial_exercise_completions to service_role;

create policy "Users can read their initial exercise completion"
on public.initial_exercise_completions
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.complete_initial_exercise(
  p_idempotency_key uuid,
  p_emotional_score smallint,
  p_reflection_text text
)
returns public.initial_exercise_completions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_completion public.initial_exercise_completions;
  result public.initial_exercise_completions;
begin
  if current_user_id is null then
    raise exception 'AUTH_SESSION_REQUIRED';
  end if;

  if p_emotional_score is null or p_emotional_score not between 1 and 5 then
    raise exception 'INVALID_EMOTIONAL_SCORE';
  end if;

  if p_reflection_text is null
    or char_length(trim(p_reflection_text)) not between 1 and 150 then
    raise exception 'INVALID_REFLECTION';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('initial:' || current_user_id::text, 0));

  select * into existing_completion
  from public.initial_exercise_completions
  where user_id = current_user_id;

  if found then
    return existing_completion;
  end if;

  insert into public.initial_exercise_completions (
    user_id,
    idempotency_key,
    emotional_score,
    reflection_text
  ) values (
    current_user_id,
    p_idempotency_key,
    p_emotional_score,
    trim(p_reflection_text)
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.complete_initial_exercise(uuid, smallint, text)
  from public, anon;
grant execute on function public.complete_initial_exercise(uuid, smallint, text)
  to authenticated;

create or replace function public.complete_exercise(
  p_exercise_id uuid,
  p_idempotency_key uuid,
  p_duration_seconds integer default null,
  p_emotional_score smallint default null,
  p_reflection_text text default null
)
returns public.exercise_completions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  server_completed_at timestamptz;
  server_business_date date;
  expected_exercise_id uuid;
  next_repetition integer;
  target_already_completed boolean;
  repetitions_today integer;
  existing_completion public.exercise_completions;
  result public.exercise_completions;
begin
  if current_user_id is null then
    raise exception 'AUTH_SESSION_REQUIRED';
  end if;

  if p_duration_seconds is not null and p_duration_seconds < 0 then
    raise exception 'INVALID_DURATION';
  end if;

  if p_emotional_score is null or p_emotional_score not between 1 and 5 then
    raise exception 'INVALID_EMOTIONAL_SCORE';
  end if;

  if p_reflection_text is null
    or char_length(trim(p_reflection_text)) not between 1 and 150 then
    raise exception 'INVALID_REFLECTION';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  select * into existing_completion
  from public.exercise_completions
  where user_id = current_user_id
    and idempotency_key = p_idempotency_key;

  if found then
    if existing_completion.exercise_id <> p_exercise_id then
      raise exception 'IDEMPOTENCY_KEY_CONFLICT';
    end if;

    return existing_completion;
  end if;

  server_completed_at := clock_timestamp();
  server_business_date := (server_completed_at at time zone 'America/Mexico_City')::date;

  select exists (
    select 1
    from public.exercise_completions
    join public.exercises on exercises.id = exercise_completions.exercise_id
    join public.levels on levels.id = exercises.level_id
    where exercise_completions.user_id = current_user_id
      and exercise_completions.exercise_id = p_exercise_id
      and exercises.publication_status = 'published'
      and exercises.position is not null
      and levels.publication_status = 'published'
  ) into target_already_completed;

  if target_already_completed then
    select count(*) into repetitions_today
    from public.exercise_completions
    where user_id = current_user_id
      and exercise_id = p_exercise_id
      and business_date = server_business_date
      and repetition_number > 1;

    if repetitions_today >= 10 then
      raise exception 'DAILY_REPETITION_LIMIT_REACHED';
    end if;
  elsif exists (
    select 1
    from public.exercise_completions
    where user_id = current_user_id
      and business_date = server_business_date
      and advances_journey
  ) then
    raise exception 'DAILY_ADVANCE_LIMIT_REACHED';
  end if;

  select exercises.id into expected_exercise_id
  from public.exercises
  join public.levels on levels.id = exercises.level_id
  where exercises.publication_status = 'published'
    and exercises.position is not null
    and levels.publication_status = 'published'
    and not exists (
      select 1
      from public.exercise_completions
      where exercise_completions.user_id = current_user_id
        and exercise_completions.exercise_id = exercises.id
    )
  order by levels.number, exercises.position, exercises.id
  limit 1;

  if not target_already_completed then
    if expected_exercise_id is null then
      raise exception 'NO_AVAILABLE_EXERCISE';
    end if;

    if expected_exercise_id <> p_exercise_id then
      raise exception 'OUT_OF_SEQUENCE';
    end if;
  end if;

  select coalesce(max(repetition_number), 0) + 1 into next_repetition
  from public.exercise_completions
  where user_id = current_user_id
    and exercise_id = p_exercise_id;

  insert into public.exercise_completions (
    user_id,
    exercise_id,
    idempotency_key,
    repetition_number,
    advances_journey,
    completed_at,
    business_date,
    duration_seconds,
    emotional_score
  ) values (
    current_user_id,
    p_exercise_id,
    p_idempotency_key,
    next_repetition,
    not target_already_completed,
    server_completed_at,
    server_business_date,
    p_duration_seconds,
    p_emotional_score
  )
  returning * into result;

  insert into public.exercise_progress (
    user_id,
    exercise_id,
    progress_percentage,
    last_activity_at
  ) values (
    current_user_id,
    p_exercise_id,
    100,
    server_completed_at
  )
  on conflict (user_id, exercise_id) do update set
    progress_percentage = 100,
    last_activity_at = excluded.last_activity_at,
    updated_at = server_completed_at;

  insert into public.completion_reflections (
    completion_id,
    reflection_text
  ) values (
    result.id,
    trim(p_reflection_text)
  );

  return result;
end;
$$;

revoke all on function public.complete_exercise(uuid, uuid, integer, smallint, text)
  from public, anon;
grant execute on function public.complete_exercise(uuid, uuid, integer, smallint, text)
  to authenticated;

comment on column public.exercises.guide_phrase is
  'Short guide phrase shown before the exercise begins.';
comment on column public.exercises.instructions is
  'Published instructions shown before the exercise content.';
comment on table public.initial_exercise_completions is
  'One authoritative onboarding exercise completion per auth.uid(); it never advances the Camino.';
comment on function public.complete_initial_exercise(uuid, smallint, text) is
  'Idempotently records the initial exercise under auth.uid() without consuming the Camino daily limit.';
comment on function public.complete_exercise(uuid, uuid, integer, smallint, text) is
  'Authoritative atomic Camino completion with required emotion and a 1-150 character reflection.';

commit;
