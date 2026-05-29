-- 1. Create Events Table
create table events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  keyword text not null,
  active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add event_id to existing tables
alter table checkins add column event_id uuid references events(id);
alter table word_cloud add column event_id uuid references events(id);
alter table evaluations add column event_id uuid references events(id);
alter table jewel_choices add column event_id uuid references events(id);

-- 3. Enable RLS and Policies for events
alter table events enable row level security;
create policy "Enable read for all users" on events for select using (true);

-- 4. Insert Initial Events (User requested examples)
insert into events (name, slug, keyword, active) values 
('Integrar (Cinema)', 'cinema', 'cinema2024', false),
('Integrar (Renê)', 'rene', 'integrar', true);

-- 5. Migration: Associate existing data with the 'Cinema' event
-- Note: Replace the slug if you want to associate with a different event
do $$ 
declare 
    cinema_id uuid;
begin
    select id into cinema_id from events where slug = 'cinema' limit 1;
    
    update checkins set event_id = cinema_id where event_id is null;
    update word_cloud set event_id = cinema_id where event_id is null;
    update evaluations set event_id = cinema_id where event_id is null;
    update jewel_choices set event_id = cinema_id where event_id is null;
end $$;
