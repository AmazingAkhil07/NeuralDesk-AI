-- Comprehensive Schema Cleanup for Ideas (Phase 4)
-- This script fixes ALL legacy constraint issues by cleaning up 'description' and 'category'.

-- 1. Enable moddatetime extension
create extension if not exists "moddatetime" schema "extensions";

-- 2. Create the table foundation if it doesn't exist at all
create table if not exists public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. REMOVE Legacy Constraints (Crucial Step: Remove NOT NULL for old columns)
do $$
begin
    -- Fix 'description' constraint (if exists)
    if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'ideas' and column_name = 'description') then
        alter table public.ideas alter column description drop not null;
    end if;

    -- Fix 'category' constraint (if exists)
    if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'ideas' and column_name = 'category') then
        alter table public.ideas alter column category drop not null;
    end if;

    -- Fix 'title' constraint (if exists)
    if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'ideas' and column_name = 'title') then
        alter table public.ideas alter column title drop not null;
    end if;
end $$;

-- 4. Ensure New Schema Columns Exist
alter table public.ideas add column if not exists name text;
alter table public.ideas add column if not exists one_liner text;
alter table public.ideas add column if not exists problem text;
alter table public.ideas add column if not exists target_user text;
alter table public.ideas add column if not exists solution text;
alter table public.ideas add column if not exists why_ai text;

-- Analysis columns
alter table public.ideas add column if not exists score integer;
alter table public.ideas add column if not exists recommendation text;
alter table public.ideas add column if not exists brutal_summary text;
alter table public.ideas add column if not exists analysis_json jsonb;

-- 5. Data Backfill (Prevent NULL errors on new columns)
update public.ideas set name = 'Untitled Idea' where name is null;
update public.ideas set one_liner = 'Pending Details' where one_liner is null;
update public.ideas set problem = 'Pending Details' where problem is null;
update public.ideas set target_user = 'Startups' where target_user is null;
update public.ideas set solution = 'Check Details' where solution is null;
update public.ideas set why_ai = 'Efficiency' where why_ai is null;

-- 6. Enforce NOT NULL on active columns (to catch future bugs)
alter table public.ideas alter column name set not null;
alter table public.ideas alter column one_liner set not null;
alter table public.ideas alter column problem set not null;
alter table public.ideas alter column target_user set not null;
alter table public.ideas alter column solution set not null;
alter table public.ideas alter column why_ai set not null;


-- 7. Reset RLS Policies
alter table public.ideas enable row level security;

drop policy if exists "Users can view their own ideas" on public.ideas;
create policy "Users can view their own ideas" on public.ideas for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own ideas" on public.ideas;
create policy "Users can insert their own ideas" on public.ideas for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ideas" on public.ideas;
create policy "Users can update their own ideas" on public.ideas for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own ideas" on public.ideas;
create policy "Users can delete their own ideas" on public.ideas for delete using (auth.uid() = user_id);

-- 8. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
