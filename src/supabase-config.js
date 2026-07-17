// ── Supabase-Konfiguration ────────────────────────────────────────────────
// Key: Dashboard → Project Settings → API Keys → "Publishable key"
// (sb_publishable_… – Nachfolger des Legacy-Anon-Keys, beide funktionieren hier).
//
// Der Publishable-/Anon-Key ist für den Browser gedacht und darf öffentlich
// sein – alle Daten sind über Row-Level-Security (supabase/schema.sql) geschützt.
// Den Secret key (sb_secret_…) NIEMALS hier eintragen.
//
// Solange der Key leer ist, läuft Audiora im Demo-Modus ohne Login.

export const SUPABASE_URL = 'https://ghkefntjoyzpnmsnzvnb.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_oqXjKBYOLiueGdQEgJjLGA_iT3QIuRu'
