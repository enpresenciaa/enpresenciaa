begin;

create table public.user_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index user_favorites_exercise_id_idx
  on public.user_favorites (exercise_id);

alter table public.user_favorites enable row level security;

revoke all on public.user_favorites from public, anon, authenticated;
grant select, insert, delete on public.user_favorites to authenticated;
grant all on public.user_favorites to service_role;

create policy "Users can read their own favorites"
on public.user_favorites for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can favorite published exercises"
on public.user_favorites for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.exercises
    join public.levels on levels.id = exercises.level_id
    where exercises.id = user_favorites.exercise_id
      and exercises.publication_status = 'published'
      and exercises.position is not null
      and levels.publication_status = 'published'
  )
);

create policy "Users can remove their own favorites"
on public.user_favorites for delete to authenticated
using ((select auth.uid()) = user_id);

comment on table public.user_favorites is
  'Favorites shared by anonymous and permanent authenticated users. Future account merging combines rows by primary-key union.';

commit;
