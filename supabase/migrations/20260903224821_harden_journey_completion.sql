begin;

alter table public.exercise_completions
  add column business_date date,
  add column advances_journey boolean not null default false;

update public.exercise_completions
set business_date = (completed_at at time zone 'America/Mexico_City')::date
where business_date is null;

update public.exercise_completions
set advances_journey = true
where repetition_number = 1;

alter table public.exercise_completions
  alter column business_date set not null,
  add constraint exercise_completions_business_date_matches_completed_at
    check (business_date = (completed_at at time zone 'America/Mexico_City')::date);

create unique index exercise_completions_user_daily_advance_unique_idx
  on public.exercise_completions (user_id, business_date)
  where advances_journey;

create index exercise_completions_user_exercise_daily_repetition_idx
  on public.exercise_completions (user_id, exercise_id, business_date)
  where repetition_number > 1;

revoke all on public.exercise_progress from anon, authenticated;
revoke all on public.exercise_completions from anon, authenticated;
revoke all on public.completion_reflections from anon, authenticated;

grant select on public.exercise_progress to authenticated;
grant select on public.exercise_completions to authenticated;
grant select on public.completion_reflections to authenticated;

drop policy if exists "Users can create their own exercise progress"
  on public.exercise_progress;
drop policy if exists "Users can update their own exercise progress"
  on public.exercise_progress;
drop policy if exists "Users can create reflections for their completions"
  on public.completion_reflections;
drop policy if exists "Users can update reflections from their completions"
  on public.completion_reflections;

drop function if exists public.complete_exercise(uuid, uuid, timestamptz, integer, smallint);

create function public.complete_exercise(
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

  if p_emotional_score is not null and p_emotional_score not between 1 and 5 then
    raise exception 'INVALID_EMOTIONAL_SCORE';
  end if;

  if p_reflection_text is not null
    and char_length(trim(p_reflection_text)) not between 1 and 5000 then
    raise exception 'INVALID_REFLECTION';
  end if;

  -- Serialize all completion attempts for this user, including different exercises.
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

  if p_reflection_text is not null then
    insert into public.completion_reflections (
      completion_id,
      reflection_text
    ) values (
      result.id,
      trim(p_reflection_text)
    );
  end if;

  return result;
end;
$$;

revoke all on function public.complete_exercise(uuid, uuid, integer, smallint, text)
  from public, anon;
grant execute on function public.complete_exercise(uuid, uuid, integer, smallint, text)
  to authenticated;

comment on column public.exercise_completions.business_date is
  'Server-derived completion date in the America/Mexico_City business timezone.';

comment on function public.complete_exercise(uuid, uuid, integer, smallint, text) is
  'Authoritative atomic Camino completion: at most one new journey advance daily, plus up to ten daily repetitions of each completed exercise, with idempotent progress and optional reflection.';

commit;
