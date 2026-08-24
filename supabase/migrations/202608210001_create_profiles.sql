create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) between 2 and 100),
  date_of_birth date check (date_of_birth is null or date_of_birth between date '1900-01-01' and current_date),
  phone text,
  language text not null default 'es-MX' check (language ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Editable application profile associated one-to-one with auth.users.';
comment on column public.profiles.phone is 'Profile phone; does not imply Supabase Auth phone verification.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();

create function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata_birth_date date;
  metadata_birth_date_text text;
begin
  metadata_birth_date_text := new.raw_user_meta_data ->> 'date_of_birth';

  if metadata_birth_date_text ~ '^\d{4}-\d{2}-\d{2}$' then
    metadata_birth_date := metadata_birth_date_text::date;
  elsif metadata_birth_date_text ~ '^\d{2}/\d{2}/\d{4}$' then
    metadata_birth_date := to_date(metadata_birth_date_text, 'DD/MM/YYYY');
  end if;

  insert into public.profiles (id, full_name, date_of_birth, phone, avatar_url)
  values (
    new.id,
    left(nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')), ''), 100),
    metadata_birth_date,
    nullif(trim(coalesce(new.phone, new.raw_user_meta_data ->> 'phone')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')), '')
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    raise warning 'Could not create profile for auth user %: %', new.id, sqlerrm;
    return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

insert into public.profiles (id, full_name, date_of_birth, phone, avatar_url, created_at, updated_at)
select
  users.id,
  left(nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name')), ''), 100),
  case
    when users.raw_user_meta_data ->> 'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      then (users.raw_user_meta_data ->> 'date_of_birth')::date
    when users.raw_user_meta_data ->> 'date_of_birth' ~ '^\d{2}/\d{2}/\d{4}$'
      then to_date(users.raw_user_meta_data ->> 'date_of_birth', 'DD/MM/YYYY')
    else null
  end,
  nullif(trim(coalesce(users.phone, users.raw_user_meta_data ->> 'phone')), ''),
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'avatar_url', users.raw_user_meta_data ->> 'picture')), ''),
  users.created_at,
  coalesce(users.updated_at, users.created_at)
from auth.users as users
on conflict (id) do nothing;
