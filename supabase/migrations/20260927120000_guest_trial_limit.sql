begin;

-- Guest (anonymous) trial: 360 hours (15 × 24 h) from the first recorded activity,
-- capped at 15 new Camino advances, whichever comes first. Accounts are exempt.
-- Once expired, a guest cannot complete any Camino exercise (advance or repetition).
create or replace function public.compute_guest_trial(p_user_id uuid)
returns table (
  started_at timestamptz,
  ends_at timestamptz,
  advances_used integer,
  advances_limit integer,
  is_expired boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with activity as (
    select
      -- least() ignores nulls: the trial starts at the earliest known activity.
      least(
        (select initial.completed_at
         from public.initial_exercise_completions as initial
         where initial.user_id = p_user_id),
        (select min(completions.completed_at)
         from public.exercise_completions as completions
         where completions.user_id = p_user_id)
      ) as started_at,
      (select count(*)::integer
       from public.exercise_completions as completions
       where completions.user_id = p_user_id
         and completions.advances_journey) as advances_used
  )
  select
    activity.started_at,
    activity.started_at + interval '360 hours',
    activity.advances_used,
    15,
    activity.started_at is not null
      and (now() >= activity.started_at + interval '360 hours' or activity.advances_used >= 15)
  from activity;
$$;

-- Internal helper: only other security definer functions (same owner) may call it.
revoke all on function public.compute_guest_trial(uuid) from public, anon, authenticated;

create or replace function public.get_guest_trial()
returns table (
  is_guest boolean,
  started_at timestamptz,
  ends_at timestamptz,
  advances_used integer,
  advances_limit integer,
  is_expired boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  guest boolean;
begin
  if current_user_id is null then
    raise exception 'AUTH_SESSION_REQUIRED';
  end if;

  -- auth.users is authoritative; a JWT can keep is_anonymous until it refreshes.
  select coalesce(users.is_anonymous, false) into guest
  from auth.users as users
  where users.id = current_user_id;

  return query
  select
    coalesce(guest, false),
    trial.started_at,
    trial.ends_at,
    trial.advances_used,
    trial.advances_limit,
    coalesce(guest, false) and trial.is_expired
  from public.compute_guest_trial(current_user_id) as trial;
end;
$$;

revoke all on function public.get_guest_trial() from public, anon;
grant execute on function public.get_guest_trial() to authenticated;

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

  -- Checked after the idempotent replay so a retried, already saved completion still succeeds.
  if coalesce((select users.is_anonymous from auth.users as users where users.id = current_user_id), false)
    and coalesce((select trial.is_expired from public.compute_guest_trial(current_user_id) as trial), false) then
    raise exception 'GUEST_TRIAL_EXPIRED';
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

comment on function public.compute_guest_trial(uuid) is
  'Internal: guest trial window (360 h from first activity) and 15-advance cap for a user.';
comment on function public.get_guest_trial() is
  'Guest trial status for auth.uid(); is_expired is always false for accounts.';
comment on function public.complete_exercise(uuid, uuid, integer, smallint, text) is
  'Authoritative atomic Camino completion with required emotion and a 1-150 character reflection; rejects expired guest trials.';

commit;
