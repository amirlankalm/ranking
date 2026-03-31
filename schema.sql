-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  role text default 'user'::text check (role in ('user', 'admin')),
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create students table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  class text not null,
  instagram_username text not null,
  photo_url text not null,
  votes integer default 0 not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.students enable row level security;

-- Policies for students
create policy "Approved students are viewable by everyone" on public.students
  for select using (status = 'approved');

create policy "Admins can view all students" on public.students
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Authenticated users can insert students" on public.students
  for insert with check (auth.role() = 'authenticated');

-- Admin controls for students
create policy "Admins can update students" on public.students
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can delete students" on public.students
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- 3. Create votes table to prevent double voting
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, user_id)
);

alter table public.votes enable row level security;

-- Policies for votes
create policy "Votes are viewable by everyone" on public.votes
  for select using (true);

create policy "Authenticated users can insert votes" on public.votes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Users can delete their own votes
create policy "Users can delete own votes" on public.votes
  for delete using (auth.uid() = user_id);

-- 4. Storage Bucket Setup
insert into storage.buckets (id, name, public) 
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

-- Policies for objects
create policy "Anyone can select photos" on storage.objects
  for select using (bucket_id = 'student-photos');

create policy "Authenticated users can upload photos" on storage.objects
  for insert with check (
    bucket_id = 'student-photos' and auth.role() = 'authenticated'
  );

-- Only admins can manually delete photos if needed
create policy "Admins can delete photos" on storage.objects
  for delete using (
    bucket_id = 'student-photos' and 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
