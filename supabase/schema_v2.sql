-- ── Audiora Schema v2: Community-Listen & Folgen ─────────────────────────
-- Einmalig im Supabase SQL-Editor ausführen (nach schema.sql).
-- Sicher erneut ausführbar (idempotent).

-- 1. Nutzer-Listen (öffentlich sichtbar, nur vom Besitzer bearbeitbar)
create table if not exists public.user_lists (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 300),
  created_at timestamptz not null default now()
);

alter table public.user_lists enable row level security;

drop policy if exists "Listen sind öffentlich" on public.user_lists;
create policy "Listen sind öffentlich" on public.user_lists for select using (true);
drop policy if exists "Eigene Listen anlegen" on public.user_lists;
create policy "Eigene Listen anlegen" on public.user_lists for insert with check (auth.uid() = owner);
drop policy if exists "Eigene Listen ändern" on public.user_lists;
create policy "Eigene Listen ändern" on public.user_lists for update using (auth.uid() = owner);
drop policy if exists "Eigene Listen löschen" on public.user_lists;
create policy "Eigene Listen löschen" on public.user_lists for delete using (auth.uid() = owner);

-- 2. Titel in Listen
create table if not exists public.list_items (
  list_id uuid not null references public.user_lists (id) on delete cascade,
  item_id text not null,
  added_at timestamptz not null default now(),
  primary key (list_id, item_id)
);

alter table public.list_items enable row level security;

drop policy if exists "Listeninhalte sind öffentlich" on public.list_items;
create policy "Listeninhalte sind öffentlich" on public.list_items for select using (true);
drop policy if exists "Nur Besitzer fügt hinzu" on public.list_items;
create policy "Nur Besitzer fügt hinzu" on public.list_items for insert
  with check (exists (select 1 from public.user_lists l where l.id = list_id and l.owner = auth.uid()));
drop policy if exists "Nur Besitzer entfernt" on public.list_items;
create policy "Nur Besitzer entfernt" on public.list_items for delete
  using (exists (select 1 from public.user_lists l where l.id = list_id and l.owner = auth.uid()));

-- 3. Likes auf Listen
create table if not exists public.list_likes (
  list_id uuid not null references public.user_lists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

alter table public.list_likes enable row level security;

drop policy if exists "Likes sind öffentlich zählbar" on public.list_likes;
create policy "Likes sind öffentlich zählbar" on public.list_likes for select using (true);
drop policy if exists "Eigene Likes setzen" on public.list_likes;
create policy "Eigene Likes setzen" on public.list_likes for insert with check (auth.uid() = user_id);
drop policy if exists "Eigene Likes entfernen" on public.list_likes;
create policy "Eigene Likes entfernen" on public.list_likes for delete using (auth.uid() = user_id);

-- 4. Folgen (Nutzer ↔ Nutzer)
create table if not exists public.follows (
  follower uuid not null references public.profiles (id) on delete cascade,
  followed uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, followed),
  check (follower <> followed)
);

alter table public.follows enable row level security;

drop policy if exists "Follows sind öffentlich" on public.follows;
create policy "Follows sind öffentlich" on public.follows for select using (true);
drop policy if exists "Selbst folgen" on public.follows;
create policy "Selbst folgen" on public.follows for insert with check (auth.uid() = follower);
drop policy if exists "Selbst entfolgen" on public.follows;
create policy "Selbst entfolgen" on public.follows for delete using (auth.uid() = follower);
