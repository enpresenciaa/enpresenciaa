begin;

create table public.billing_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  stripe_customer_id text not null unique check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.billing_customers (user_id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  stripe_subscription_id text not null unique check (stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
  stripe_price_id text not null check (stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
  status text not null check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused'
  )),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  ended_at timestamptz,
  last_stripe_event_created_at bigint not null check (last_stripe_event_created_at >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    current_period_start is null
    or current_period_end is null
    or current_period_end >= current_period_start
  )
);

create index billing_subscriptions_user_status_idx
on public.billing_subscriptions (user_id, status, updated_at desc);

create table public.billing_checkout_attempts (
  attempt_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_checkout_session_id text unique
    check (stripe_checkout_session_id is null or stripe_checkout_session_id ~ '^cs_(test_|live_)?[A-Za-z0-9]+$'),
  status text not null default 'creating'
    check (status in ('creating', 'open', 'completed', 'expired', 'failed')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index billing_checkout_attempts_one_open_per_user_idx
on public.billing_checkout_attempts (user_id)
where status in ('creating', 'open');

create table public.stripe_webhook_events (
  stripe_event_id text primary key check (stripe_event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text not null check (char_length(trim(event_type)) between 1 and 100),
  stripe_created_at bigint not null check (stripe_created_at >= 0),
  processing_status text not null default 'processing'
    check (processing_status in ('processing', 'processed', 'ignored', 'failed')),
  error_code text check (error_code is null or char_length(error_code) between 1 and 100),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index stripe_webhook_events_status_received_idx
on public.stripe_webhook_events (processing_status, received_at desc);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_checkout_attempts enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on public.billing_customers, public.billing_subscriptions, public.billing_checkout_attempts, public.stripe_webhook_events from anon, authenticated;
grant select on public.billing_customers, public.billing_subscriptions to authenticated;
grant all on public.billing_customers, public.billing_subscriptions, public.billing_checkout_attempts, public.stripe_webhook_events to service_role;

create policy "Users can read their own billing customer"
on public.billing_customers for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own billing subscriptions"
on public.billing_subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

create function public.set_billing_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_billing_updated_at() from public, anon, authenticated;

create trigger set_billing_customers_updated_at
before update on public.billing_customers
for each row execute procedure public.set_billing_updated_at();

create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute procedure public.set_billing_updated_at();

create trigger set_billing_checkout_attempts_updated_at
before update on public.billing_checkout_attempts
for each row execute procedure public.set_billing_updated_at();

create trigger set_stripe_webhook_events_updated_at
before update on public.stripe_webhook_events
for each row execute procedure public.set_billing_updated_at();

create function public.claim_stripe_webhook_event(
  p_stripe_event_id text,
  p_event_type text,
  p_stripe_created_at bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_event_id text;
begin
  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    stripe_created_at,
    processing_status,
    error_code,
    processed_at
  ) values (
    p_stripe_event_id,
    p_event_type,
    p_stripe_created_at,
    'processing',
    null,
    null
  )
  on conflict (stripe_event_id) do update set
    processing_status = 'processing',
    error_code = null,
    processed_at = null,
    updated_at = now()
  where stripe_webhook_events.processing_status = 'failed'
  returning stripe_event_id into claimed_event_id;

  return claimed_event_id is not null;
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text, bigint) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text, bigint) to service_role;

create function public.sync_stripe_subscription(
  p_user_id uuid,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_canceled_at timestamptz,
  p_ended_at timestamptz,
  p_stripe_event_created_at bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  synced_subscription_id uuid;
begin
  if p_status not in (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused'
  ) then
    raise exception 'INVALID_SUBSCRIPTION_STATUS';
  end if;

  insert into public.billing_subscriptions (
    user_id,
    stripe_subscription_id,
    stripe_price_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    canceled_at,
    ended_at,
    last_stripe_event_created_at
  ) values (
    p_user_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_status,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    p_canceled_at,
    p_ended_at,
    p_stripe_event_created_at
  )
  on conflict (stripe_subscription_id) do update set
    stripe_price_id = excluded.stripe_price_id,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    canceled_at = excluded.canceled_at,
    ended_at = excluded.ended_at,
    last_stripe_event_created_at = excluded.last_stripe_event_created_at,
    updated_at = now()
  where excluded.user_id = billing_subscriptions.user_id
    and excluded.last_stripe_event_created_at >= billing_subscriptions.last_stripe_event_created_at
  returning id into synced_subscription_id;

  return synced_subscription_id is not null;
end;
$$;

revoke all on function public.sync_stripe_subscription(uuid, text, text, text, timestamptz, timestamptz, boolean, timestamptz, timestamptz, bigint) from public, anon, authenticated;
grant execute on function public.sync_stripe_subscription(uuid, text, text, text, timestamptz, timestamptz, boolean, timestamptz, timestamptz, bigint) to service_role;

comment on table public.billing_customers is
'Server-owned mapping between an internal auth user and a Stripe test customer.';

comment on table public.billing_subscriptions is
'Webhook-authoritative Stripe subscription state. It does not grant product entitlements.';

comment on table public.billing_checkout_attempts is
'Server-only concurrency guard for short-lived Stripe Checkout attempts.';

comment on table public.stripe_webhook_events is
'Minimal Stripe webhook deduplication and processing audit without payment payloads.';

commit;
