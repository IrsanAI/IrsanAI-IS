-- IrsanAI IS -- Performance Tracking (Paragon System)
-- Run in Supabase SQL editor

create table if not exists public.is_task_metrics (
  id          uuid        default gen_random_uuid() primary key,
  task_text   text        not null,
  task_type   text        not null,
  loadout_id  text        not null,
  primary_llm text        not null,
  confidence  float8      not null check (confidence between 0 and 1),
  latency_ms  integer     not null check (latency_ms >= 0),
  success     boolean     not null default true,
  error_msg   text,
  created_at  timestamptz not null default now()
);

create index if not exists is_task_metrics_task_type_idx  on public.is_task_metrics (task_type);
create index if not exists is_task_metrics_loadout_id_idx on public.is_task_metrics (loadout_id);
create index if not exists is_task_metrics_created_at_idx on public.is_task_metrics (created_at desc);

alter table public.is_task_metrics enable row level security;

comment on table public.is_task_metrics is
  'IrsanAI IS -- Task routing metrics for metacognitive self-optimization (Paragon System)';
