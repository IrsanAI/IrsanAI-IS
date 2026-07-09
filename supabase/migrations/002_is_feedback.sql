-- IrsanAI IS -- Manual Feedback (Ground Truth Signal)
-- Run AFTER 001_is_task_metrics.sql

create table if not exists public.is_feedback (
  id          uuid        default gen_random_uuid() primary key,
  route_id    uuid        not null references public.is_task_metrics(id) on delete cascade,
  correct     boolean     not null,
  rating      smallint    not null check (rating between 1 and 5),
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists is_feedback_route_id_idx
  on public.is_feedback (route_id);

alter table public.is_feedback enable row level security;

comment on table public.is_feedback is
  'IrsanAI IS -- Manual ground truth signal. correct=true means the IS chose the right loadout.';

comment on column public.is_feedback.rating is
  '1=poor 2=fair 3=ok 4=good 5=excellent -- overall quality of the routed response';
