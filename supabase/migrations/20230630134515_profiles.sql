create table public.profiles(
  id uuid unique references auth.users on delete cascade,
  full_name text,
  updated_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  primary key (id)
);

/* 
This makes it so that nobody except those who are admins can access
these rows
*/
alter table public.profiles enable row level security;

/* 
Add more permissions as needed
*/
create policy "Users can view own profile" on profiles
  for select to authenticated
    using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update to authenticated
    using (auth.uid() = id);

/* 
Add a trigger 
*/

create or replace function public.handle_new_user()
  returns trigger
  as $$
begin
  insert into public.profiles(id, full_name)
    values(new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$
language plpgsql
security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure public.handle_new_user();