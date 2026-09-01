begin;

alter table public.levels
  add column description text,
  add column publication_status text not null default 'draft',
  add column is_premium boolean not null default false,
  add constraint levels_publication_status_check
    check (publication_status in ('draft', 'published', 'archived'));

alter table public.exercises
  add column position smallint,
  add column description text,
  add column estimated_duration_minutes smallint,
  add column publication_status text not null default 'draft',
  add constraint exercises_position_check
    check (position is null or position > 0),
  add constraint exercises_duration_check
    check (estimated_duration_minutes is null or estimated_duration_minutes > 0),
  add constraint exercises_publication_status_check
    check (publication_status in ('draft', 'published', 'archived'));

create unique index exercises_level_position_unique_idx
  on public.exercises (level_id, position)
  where position is not null;

create table public.exercise_contents (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  modality text not null check (modality in ('audio', 'video', 'text')),
  locale text not null default 'es-MX'
    check (char_length(trim(locale)) between 2 and 35),
  storage_path text unique,
  text_content text,
  mime_type text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_contents_payload_check check (
    (
      modality = 'text'
      and nullif(trim(text_content), '') is not null
      and storage_path is null
      and mime_type is null
    )
    or
    (
      modality in ('audio', 'video')
      and nullif(trim(storage_path), '') is not null
      and text_content is null
      and nullif(trim(mime_type), '') is not null
    )
  ),
  unique (exercise_id, modality, locale)
);

create index exercise_contents_exercise_idx
  on public.exercise_contents (exercise_id);

create table public.completion_reflections (
  completion_id uuid primary key
    references public.exercise_completions (id) on delete cascade,
  reflection_text text not null
    check (char_length(trim(reflection_text)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_exercise_contents_updated_at
before update on public.exercise_contents
for each row execute procedure public.set_journal_updated_at();

create trigger set_completion_reflections_updated_at
before update on public.completion_reflections
for each row execute procedure public.set_journal_updated_at();

alter table public.exercise_contents enable row level security;
alter table public.completion_reflections enable row level security;

revoke all on public.exercise_contents, public.completion_reflections from anon;
grant select on public.exercise_contents to authenticated;
grant select, insert, update on public.completion_reflections to authenticated;
grant all on public.exercise_contents, public.completion_reflections to service_role;

create policy "Authenticated users can read published exercise contents"
on public.exercise_contents for select to authenticated
using (
  publication_status = 'published'
  and exists (
    select 1
    from public.exercises
    join public.levels on levels.id = exercises.level_id
    where exercises.id = exercise_contents.exercise_id
      and exercises.publication_status = 'published'
      and levels.publication_status = 'published'
  )
);

create policy "Users can read reflections from their completions"
on public.completion_reflections for select to authenticated
using (
  exists (
    select 1 from public.exercise_completions
    where exercise_completions.id = completion_reflections.completion_id
      and exercise_completions.user_id = (select auth.uid())
  )
);

create policy "Users can create reflections for their completions"
on public.completion_reflections for insert to authenticated
with check (
  exists (
    select 1 from public.exercise_completions
    where exercise_completions.id = completion_reflections.completion_id
      and exercise_completions.user_id = (select auth.uid())
  )
);

create policy "Users can update reflections from their completions"
on public.completion_reflections for update to authenticated
using (
  exists (
    select 1 from public.exercise_completions
    where exercise_completions.id = completion_reflections.completion_id
      and exercise_completions.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.exercise_completions
    where exercise_completions.id = completion_reflections.completion_id
      and exercise_completions.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public)
values ('exercise-content', 'exercise-content', false)
on conflict (id) do update set public = false;

create policy "Authenticated users can read published exercise media"
on storage.objects for select to authenticated
using (
  bucket_id = 'exercise-content'
  and exists (
    select 1
    from public.exercise_contents
    join public.exercises on exercises.id = exercise_contents.exercise_id
    join public.levels on levels.id = exercises.level_id
    where exercise_contents.storage_path = storage.objects.name
      and exercise_contents.modality in ('audio', 'video')
      and exercise_contents.publication_status = 'published'
      and exercises.publication_status = 'published'
      and levels.publication_status = 'published'
  )
);

comment on table public.exercise_contents is
  'Alternative localized modalities for an exercise. Media files live in the private exercise-content Storage bucket.';

comment on table public.completion_reflections is
  'Editable one-to-one reflection associated with an immutable exercise completion.';

commit;

-- Deferred to a catalog activation migration:
-- 1. official catalog backfill and positions;
-- 2. publication of approved levels, exercises and contents;
-- 3. catalog SELECT policies restricted to published rows;
-- 4. complete_exercise server timestamp, idempotency conflict and unlock checks;
-- 5. revocation of direct exercise_progress writes;
-- 6. premium entitlement validation (not before an entitlement source exists).
