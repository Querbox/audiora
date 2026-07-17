// Importiert die echten Top-Hörbücher Deutschlands – kostenlos, ohne API-Key.
// Quellen: Apple Hörbuch-Charts (Legacy-RSS) + iTunes Lookup (Beschreibung, Links).
// Optional: Spotify-Anreicherung (Sprecher, Kapitel, Direktlink), wenn
// SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET als Umgebungsvariablen gesetzt sind.
// Ausgabe: src/real-audiobooks.json

import { writeFileSync } from 'node:fs'

const TOP_N = 30
const CHARTS = `https://itunes.apple.com/de/rss/topaudiobooks/limit=${TOP_N}/json`
const headers = { 'user-agent': 'Audiora/0.1 (Metadaten-Import)' }

const GENRE_MAP = {
  'Krimis und Thriller':        { genre: 'Thriller',     moods: ['spannend'],             situations: ['autofahrt', 'lange'],     emoji: '🔪' },
  'Belletristik':               { genre: 'Romane',       moods: ['lange', 'entspannen'],  situations: ['lange', 'einschlafen'],   emoji: '📖' },
  'Romane und Literatur':       { genre: 'Romane',       moods: ['lange', 'entspannen'],  situations: ['lange', 'einschlafen'],   emoji: '📖' },
  'Liebesromane':               { genre: 'Romane',       moods: ['entspannen'],           situations: ['einschlafen', 'lange'],   emoji: '❤️' },
  'Science-Fiction und Fantasy':{ genre: 'Fantasy',      moods: ['spannend', 'lange'],    situations: ['lange', 'autofahrt'],     emoji: '🐉' },
  'Biografien und Memoiren':    { genre: 'Gesellschaft', moods: ['lernen'],               situations: ['autofahrt', 'haushalt'],  emoji: '👤' },
  'Ratgeber':                   { genre: 'Achtsamkeit',  moods: ['lernen'],               situations: ['sport', 'haushalt'],      emoji: '🌱' },
  'Selbstentwicklung':          { genre: 'Achtsamkeit',  moods: ['lernen'],               situations: ['sport'],                  emoji: '🌱' },
  'Kinder und Jugend':          { genre: 'Kinder',       moods: ['spannend'],             situations: ['einschlafen'],            emoji: '🧸' },
  'Sachbücher':                 { genre: 'Wissenschaft', moods: ['lernen'],               situations: ['autofahrt', 'haushalt'],  emoji: '🎓' },
  'Comedy':                     { genre: 'Comedy',       moods: ['lustig'],               situations: ['haushalt', 'autofahrt'],  emoji: '😂' },
  'Wirtschaft und Finanzen':    { genre: 'Wirtschaft',   moods: ['lernen'],               situations: ['autofahrt'],              emoji: '📈' },
  'Klassiker':                  { genre: 'Klassiker',    moods: ['lange', 'entspannen'],  situations: ['einschlafen', 'lange'],   emoji: '🏛️' },
}
const FALLBACK = { genre: 'Romane', moods: ['lange'], situations: ['lange'], emoji: '🎧' }

const strip = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const hueFromString = (s) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.codePointAt(0)) % 360
  return h
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { headers, ...opts })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// ── Optional: Spotify (kostenlos, braucht einmalig App-Credentials) ──────
async function spotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || !secret) return null
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) throw new Error(res.status)
    return (await res.json()).access_token
  } catch (e) {
    console.warn(`Spotify-Token fehlgeschlagen (${e.message}) – fahre ohne fort`)
    return null
  }
}

async function spotifyAudiobook(token, title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author}`.slice(0, 90))
    const d = await fetchJson(`https://api.spotify.com/v1/search?q=${q}&type=audiobook&market=DE&limit=1`, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
    })
    const b = d.audiobooks?.items?.[0]
    if (!b) return null
    return {
      narrator: (b.narrators || []).map((n) => n.name).join(', ') || null,
      url: b.external_urls?.spotify || null,
      chapters: b.total_chapters || null,
    }
  } catch {
    return null
  }
}

// ── Import ────────────────────────────────────────────────────────────────
const feed = (await fetchJson(CHARTS)).feed.entry
console.log(`Hörbuch-Charts: ${feed.length} Titel`)

const ids = feed.map((e) => e.id.attributes['im:id'])
const lookup = await fetchJson(`https://itunes.apple.com/lookup?id=${ids.join(',')}&country=de`)
const byLookupId = new Map(lookup.results.map((r) => [String(r.collectionId), r]))

const token = await spotifyToken()
console.log(token ? 'Spotify-Anreicherung aktiv ✓' : 'Spotify-Anreicherung inaktiv (keine Credentials gesetzt)')

const out = []
let rank = 0
for (const e of feed) {
  rank += 1
  const id = e.id.attributes['im:id']
  const lu = byLookupId.get(String(id)) || {}
  const title = e['im:name'].label
  const author = e['im:artist']?.label || lu.artistName || 'Unbekannt'
  const genreName = e.category?.attributes?.label || lu.primaryGenreName || ''
  const g = GENRE_MAP[genreName] || FALLBACK

  let desc = strip(lu.description)
  if (desc.length > 300) desc = desc.slice(0, 297).trimEnd() + '…'

  const img = (e['im:image']?.at(-1)?.label || '').replace(/\/\d+x\d+bb/, '/600x600bb')

  const sp = token ? await spotifyAudiobook(token, title, author) : null

  out.push({
    id: `ab-${id}`,
    type: 'hoerbuch',
    real: true,
    chartRank: rank,
    title,
    by: author,
    speaker: sp?.narrator || null,
    chapters: sp?.chapters || null,
    year: lu.releaseDate ? Number(lu.releaseDate.slice(0, 4)) : null,
    image: img || null,
    hue: hueFromString(title),
    emoji: g.emoji,
    genres: [g.genre],
    moods: g.moods,
    situations: g.situations,
    topics: [genreName].filter(Boolean),
    desc: desc || `${title} von ${author} – aktuell in den deutschen Hörbuch-Charts.`,
    platforms: ['applebooks', 'audible', 'spotify', 'bookbeat'],
    links: {
      applebooks: lu.collectionViewUrl || e.link?.[0]?.attributes?.href || e.link?.attributes?.href,
      audible: `https://www.audible.de/search?keywords=${encodeURIComponent(title)}`,
      spotify: sp?.url || `https://open.spotify.com/search/${encodeURIComponent(title)}`,
      bookbeat: `https://www.bookbeat.com/de/search?query=${encodeURIComponent(title)}`,
    },
  })
  console.log(`  ${String(rank).padStart(2)}. ${title} — ${author}${sp?.narrator ? ` (gelesen von ${sp.narrator})` : ''}`)
}

writeFileSync(new URL('../src/real-audiobooks.json', import.meta.url), JSON.stringify(out, null, 2))
console.log(`\n${out.length} Hörbücher → src/real-audiobooks.json`)
