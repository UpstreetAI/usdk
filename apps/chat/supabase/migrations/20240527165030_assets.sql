/**
 * ASSETS ( AGENTS )
 * This table contains data for agents created by the user through the sdk and ui.
 */
create table public.assets (
  -- UUID
  id uuid not null default gen_random_uuid(),
  -- UUID from users table
  user_id uuid references auth.users not null,
  -- Time created
  created_at timestamp with time zone not null default now(),
  -- Name of the ai agent
  name text null,
  -- Preview image of the ai agent
  preview_image text null,
  -- URL for the npc file of the agent
  start_url text null,
  -- Description of the agent
  description text null,
  constraint assets_pkey primary key (id)
);
alter table assets enable row level security;
create policy "Allow public read-only access." on assets for select using (true);
