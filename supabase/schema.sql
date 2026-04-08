-- ============================================================
-- Schema for yudiprojects portfolio
-- Run this in Supabase SQL Editor before running seed.sql
-- ============================================================

-- Projects table
create table if not exists public.projects (
  id bigint generated always as identity primary key,
  node_id text not null unique,
  title text not null,
  description text not null,
  techs text[] not null default '{}',
  demo text,
  repo text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Guestbook table
create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  username text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable realtime for guestbook
alter table public.guestbook replica identity full;

-- CV Versions table
create table if not exists public.cv_versions (
  id bigint generated always as identity primary key,
  name text not null,
  content text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.projects enable row level security;
alter table public.guestbook enable row level security;
alter table public.cv_versions enable row level security;

-- Projects: anyone can read, only authenticated users can write
create policy "public read projects"
  on public.projects for select using (true);

create policy "auth insert projects"
  on public.projects for insert
  with check (auth.role() = 'authenticated');

create policy "auth update projects"
  on public.projects for update
  using (auth.role() = 'authenticated');

create policy "auth delete projects"
  on public.projects for delete
  using (auth.role() = 'authenticated');

-- CV Versions: anyone can read, only authenticated users can write
create policy "public read cv_versions"
  on public.cv_versions for select using (true);

create policy "auth insert cv_versions"
  on public.cv_versions for insert
  with check (auth.role() = 'authenticated');

create policy "auth update cv_versions"
  on public.cv_versions for update
  using (auth.role() = 'authenticated');

create policy "auth delete cv_versions"
  on public.cv_versions for delete
  using (auth.role() = 'authenticated');

-- Guestbook: anyone can read and insert, only authenticated users can delete
create policy "public read guestbook"
  on public.guestbook for select using (true);

create policy "public insert guestbook"
  on public.guestbook for insert with check (true);

create policy "auth delete guestbook"
  on public.guestbook for delete
  using (auth.role() = 'authenticated');
