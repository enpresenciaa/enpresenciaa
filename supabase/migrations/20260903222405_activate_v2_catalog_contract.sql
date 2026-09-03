begin;

-- V2 reads the Camino only after Supabase Auth has established either an
-- anonymous or permanent session. Both identities use the authenticated role.
-- Signed-out requests using the anon role have no catalog access.
revoke all on table public.levels, public.exercises, public.exercise_contents
from anon, authenticated;

grant select on table public.levels, public.exercises, public.exercise_contents
to authenticated;

drop policy if exists "Authenticated users can read levels" on public.levels;
drop policy if exists "Authenticated users can read exercises" on public.exercises;
drop policy if exists "Authenticated users can read published exercise contents" on public.exercise_contents;

create policy "Authenticated users can read published levels"
on public.levels
for select
to authenticated
using (publication_status = 'published');

create policy "Authenticated users can read published exercises"
on public.exercises
for select
to authenticated
using (
  publication_status = 'published'
  and position is not null
  and exists (
    select 1
    from public.levels
    where levels.id = exercises.level_id
      and levels.publication_status = 'published'
  )
);

create policy "Authenticated users can read published exercise contents"
on public.exercise_contents
for select
to authenticated
using (
  publication_status = 'published'
  and exists (
    select 1
    from public.exercises
    join public.levels on levels.id = exercises.level_id
    where exercises.id = exercise_contents.exercise_id
      and exercises.position is not null
      and exercises.publication_status = 'published'
      and levels.publication_status = 'published'
  )
);

-- Level number plus position defines the scalable order. The number of
-- exercises in a level remains editorially configurable; 28 is not a DB rule.
create index if not exists levels_published_number_idx
on public.levels (number)
where publication_status = 'published';

create index if not exists exercises_published_level_position_idx
on public.exercises (level_id, position)
where publication_status = 'published' and position is not null;

comment on column public.exercises.position is
'Order inside its level. Combined with levels.number to derive Camino order; level size is configurable.';

commit;
