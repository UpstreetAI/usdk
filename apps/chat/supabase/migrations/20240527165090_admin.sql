/** 
* ADMINS
* IMPORTANT NOTE: This migration must be the last to be initiated as it contains or might
* contain policies related to tables that must be created first. See create policy.
*/
create table admins (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  level int2
);
alter table admins enable row level security;
create policy "Can view own user data." on admins for select using (auth.uid() = id);

/**
 * Create policy - Only users that exist in the "admins" table can manage this table.
 */
-- create policy "Only admins can manage TABLE_NAME table" on TABLE_NAME for all using (
--   exists (
--     select
--       1
--     from
--       admins
--     where
--       id = auth.uid()
--   )
-- );