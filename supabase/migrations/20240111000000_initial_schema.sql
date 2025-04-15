-- Migration: Initial Schema Setup
-- Description: Creates all necessary tables, policies, and storage buckets for Clippie 5000

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('videos', 'videos', true),
  ('clips', 'clips', true),
  ('subtitles', 'subtitles', true)
on conflict (id) do nothing;

-- Create tables
create table if not exists public.user_api_limits (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique not null,
  count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_current_period_end timestamp with time zone,
  minutes_used integer default 0,
  minutes_limit integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  storage_url text not null,
  filename text not null,
  file_size integer not null,
  duration integer not null,
  format text not null,
  status text default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint fk_user_subscription
    foreign key (user_id)
    references public.user_subscriptions(user_id)
    on delete cascade
);

create table if not exists public.clips (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  video_id uuid not null,
  title text,
  start_time integer not null,
  end_time integer not null,
  duration integer not null,
  storage_url text,
  format text default 'mp4',
  resolution text default '720p',
  status text default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint fk_video
    foreign key (video_id)
    references public.videos(id)
    on delete cascade,
  constraint fk_user_subscription
    foreign key (user_id)
    references public.user_subscriptions(user_id)
    on delete cascade
);

create table if not exists public.transcriptions (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid unique not null,
  text text not null,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint fk_video
    foreign key (video_id)
    references public.videos(id)
    on delete cascade
);

create table if not exists public.clip_transcriptions (
  id uuid primary key default uuid_generate_v4(),
  clip_id uuid unique not null,
  text text not null,
  subtitles_url text,
  format text default 'srt',
  language text default 'en',
  font_family text,
  font_size integer,
  text_color text,
  background_color text,
  position text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint fk_clip
    foreign key (clip_id)
    references public.clips(id)
    on delete cascade
);

-- Create indexes
create index if not exists idx_videos_user_id on public.videos(user_id);
create index if not exists idx_clips_user_id on public.clips(user_id);
create index if not exists idx_clips_video_id on public.clips(video_id);

-- Enable RLS
alter table public.user_api_limits enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.videos enable row level security;
alter table public.clips enable row level security;
alter table public.transcriptions enable row level security;
alter table public.clip_transcriptions enable row level security;

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create update triggers
drop trigger if exists update_user_api_limits_updated_at on public.user_api_limits;
create trigger update_user_api_limits_updated_at
    before update on public.user_api_limits
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_user_subscriptions_updated_at on public.user_subscriptions;
create trigger update_user_subscriptions_updated_at
    before update on public.user_subscriptions
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_videos_updated_at on public.videos;
create trigger update_videos_updated_at
    before update on public.videos
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_clips_updated_at on public.clips;
create trigger update_clips_updated_at
    before update on public.clips
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_transcriptions_updated_at on public.transcriptions;
create trigger update_transcriptions_updated_at
    before update on public.transcriptions
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_clip_transcriptions_updated_at on public.clip_transcriptions;
create trigger update_clip_transcriptions_updated_at
    before update on public.clip_transcriptions
    for each row
    execute function update_updated_at_column();

-- Drop all existing policies
do $$ 
declare
  _tbl text;
begin
  for _tbl in (select tablename from pg_tables where schemaname = 'public')
  loop
    execute format('drop policy if exists "Users can view their own %s" on public.%I', _tbl, _tbl);
    execute format('drop policy if exists "Users can create their own %s" on public.%I', _tbl, _tbl);
    execute format('drop policy if exists "Users can update their own %s" on public.%I', _tbl, _tbl);
    execute format('drop policy if exists "Users can delete their own %s" on public.%I', _tbl, _tbl);
  end loop;
end $$;

-- Drop all storage policies
drop policy if exists "Authenticated users can upload videos" on storage.objects;
drop policy if exists "Authenticated users can upload clips" on storage.objects;
drop policy if exists "Authenticated users can upload subtitles" on storage.objects;
drop policy if exists "Public can view videos" on storage.objects;
drop policy if exists "Public can view clips" on storage.objects;
drop policy if exists "Public can view subtitles" on storage.objects;
drop policy if exists "Users can delete their own videos" on storage.objects;
drop policy if exists "Users can delete their own clips" on storage.objects;
drop policy if exists "Users can delete their own subtitles" on storage.objects;

-- Create all policies fresh
create policy "Users can view their own api limits"
  on public.user_api_limits for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own api limits"
  on public.user_api_limits for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own api limits"
  on public.user_api_limits for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own api limits"
  on public.user_api_limits for delete
  using (auth.uid()::text = user_id);

create policy "Users can view their own subscriptions"
  on public.user_subscriptions for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own subscription"
  on public.user_subscriptions for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own subscription"
  on public.user_subscriptions for delete
  using (auth.uid()::text = user_id);

create policy "Users can view their own videos"
  on public.videos for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own videos"
  on public.videos for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own videos"
  on public.videos for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own videos"
  on public.videos for delete
  using (auth.uid()::text = user_id);

create policy "Users can view their own clips"
  on public.clips for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own clips"
  on public.clips for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own clips"
  on public.clips for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own clips"
  on public.clips for delete
  using (auth.uid()::text = user_id);

create policy "Users can view their own transcriptions"
  on public.transcriptions for select
  using (exists (
    select 1 from public.videos
    where videos.id = transcriptions.video_id
    and videos.user_id = auth.uid()::text
  ));

create policy "Users can create transcriptions for their videos"
  on public.transcriptions for insert
  with check (exists (
    select 1 from public.videos
    where videos.id = video_id
    and videos.user_id = auth.uid()::text
  ));

create policy "Users can update transcriptions for their videos"
  on public.transcriptions for update
  using (exists (
    select 1 from public.videos
    where videos.id = video_id
    and videos.user_id = auth.uid()::text
  ));

create policy "Users can delete transcriptions for their videos"
  on public.transcriptions for delete
  using (exists (
    select 1 from public.videos
    where videos.id = video_id
    and videos.user_id = auth.uid()::text
  ));

create policy "Users can view their own clip transcriptions"
  on public.clip_transcriptions for select
  using (exists (
    select 1 from public.clips
    where clips.id = clip_transcriptions.clip_id
    and clips.user_id = auth.uid()::text
  ));

create policy "Users can create transcriptions for their clips"
  on public.clip_transcriptions for insert
  with check (exists (
    select 1 from public.clips
    where clips.id = clip_id
    and clips.user_id = auth.uid()::text
  ));

create policy "Users can update transcriptions for their clips"
  on public.clip_transcriptions for update
  using (exists (
    select 1 from public.clips
    where clips.id = clip_id
    and clips.user_id = auth.uid()::text
  ));

create policy "Users can delete transcriptions for their clips"
  on public.clip_transcriptions for delete
  using (exists (
    select 1 from public.clips
    where clips.id = clip_id
    and clips.user_id = auth.uid()::text
  ));

-- Create storage policies
create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (
    bucket_id = 'videos' and
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can upload clips"
  on storage.objects for insert
  with check (
    bucket_id = 'clips' and
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can upload subtitles"
  on storage.objects for insert
  with check (
    bucket_id = 'subtitles' and
    auth.role() = 'authenticated'
  );

create policy "Public can view videos"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "Public can view clips"
  on storage.objects for select
  using (bucket_id = 'clips');

create policy "Public can view subtitles"
  on storage.objects for select
  using (bucket_id = 'subtitles');

create policy "Users can delete their own videos"
  on storage.objects for delete
  using (
    bucket_id = 'videos' and
    auth.uid()::text = (split_part(name, '/', 1))
  );

create policy "Users can delete their own clips"
  on storage.objects for delete
  using (
    bucket_id = 'clips' and
    auth.uid()::text = (split_part(name, '/', 1))
  );

create policy "Users can delete their own subtitles"
  on storage.objects for delete
  using (
    bucket_id = 'subtitles' and
    auth.uid()::text = (split_part(name, '/', 1))
  );

-- Configure storage buckets
update storage.buckets 
set allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
where id = 'videos';

update storage.buckets 
set allowed_mime_types = array['text/plain', 'text/srt', 'text/vtt']
where id = 'subtitles';

update storage.buckets 
set file_size_limit = 500000000
where id = 'videos';

update storage.buckets 
set file_size_limit = 500000000
where id = 'clips';

update storage.buckets 
set file_size_limit = 5000000
where id = 'subtitles';

-- Create new user handler
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user handler
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 