-- IrsanAI IS -- Dynamic Routing Weights (SelfOptimizer output)
-- Run AFTER 002_is_feedback.sql

create table if not exists public.is_routing_weights (
  loadout_id            text        primary key,
  confidence_threshold  float8      not null default 0.7,
  priority_boost        integer     not null default 0,
  enabled               boolean     not null default true,
  reason                text,
  updated_at            timestamptz not null default now()
);

alter table public.is_routing_weights enable row level security;

grant usage on schema public to service_role;
grant all on table public.is_routing_weights to service_role;

comment on table public.is_routing_weights is
  'IrsanAI IS -- Runtime routing weight overrides written by SelfOptimizer. Source of truth remains registry JSON.';

comment on column public.is_routing_weights.confidence_threshold is
  'Overrides routing.minConfidence from loadout JSON when set by optimizer';

comment on column public.is_routing_weights.priority_boost is
  'Added to routing.priority at runtime -- positive = prefer, negative = avoid';
