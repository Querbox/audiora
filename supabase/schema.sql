-- ── Audiora Datenbank-Schema ─────────────────────────────────────────────
-- Einmalig im Supabase SQL-Editor ausführen (Dashboard → SQL Editor → New query).
-- Sicher erneut ausführbar (idempotent).

-- 1. Profile: öffentlicher Nutzername je Auth-User
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profile sind öffentlich lesbar" on public.profiles;
create policy "Profile sind öffentlich lesbar"
  on public.profiles for select using (true);

drop policy if exists "Eigenes Profil anlegen" on public.profiles;
create policy "Eigenes Profil anlegen"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Eigenes Profil ändern" on public.profiles;
create policy "Eigenes Profil ändern"
  on public.profiles for update using (auth.uid() = id);

-- Profil automatisch bei Registrierung anlegen (Username aus Signup-Metadaten)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      'hoerer-' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Nutzer ↔ Audio-Objekte: Favorit / Gehört / Geliked / Bewertung
create table if not exists public.user_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  fav boolean not null default false,
  heard boolean not null default false,
  liked boolean not null default false,
  rating smallint check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_items enable row level security;

drop policy if exists "Eigene Einträge lesen" on public.user_items;
create policy "Eigene Einträge lesen"
  on public.user_items for select using (auth.uid() = user_id);

drop policy if exists "Eigene Einträge anlegen" on public.user_items;
create policy "Eigene Einträge anlegen"
  on public.user_items for insert with check (auth.uid() = user_id);

drop policy if exists "Eigene Einträge ändern" on public.user_items;
create policy "Eigene Einträge ändern"
  on public.user_items for update using (auth.uid() = user_id);

drop policy if exists "Eigene Einträge löschen" on public.user_items;
create policy "Eigene Einträge löschen"
  on public.user_items for delete using (auth.uid() = user_id);
