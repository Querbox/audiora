// ── Supabase-Konfiguration ────────────────────────────────────────────────
// Beide Werte findest du im Supabase-Dashboard unter:
//   Project Settings → API  (bzw. "Data API")
//
// Der Anon-Key ist für den Browser gedacht und darf öffentlich sein –
// alle Daten sind über Row-Level-Security (siehe supabase/schema.sql) geschützt.
//
// Solange beide Werte leer sind, läuft Audiora im Demo-Modus ohne Login.

export const SUPABASE_URL = 'https://ghkefntjoyzpnmsnzvnb.supabase.co'
export const SUPABASE_ANON_KEY = '' // 'eyJhbGciOiJIUzI1NiIs...'
