// Importiert die echten Top-Podcasts Deutschlands – komplett kostenlos, ohne API-Key.
// Quellen: Apple Podcast-Charts (rss.marketingtools.apple.com), iTunes Lookup, offene RSS-Feeds.
// Ausgabe: src/real-podcasts.json im Audiora-Datenmodell.
// Läuft lokal (node scripts/import-podcasts.mjs) und nächtlich in GitHub Actions.

import { writeFileSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'

const TOP_N = 30
const CHARTS = `https://rss.marketingtools.apple.com/api/v2/de/podcasts/top/${TOP_N}/podcasts.json`

// Apple-Genre → Audiora-Genre/Stimmung/Situation/Emoji
const GENRE_MAP = {
  'True Crime':             { genre: 'True Crime',   moods: ['spannend'],            situations: ['autofahrt', 'haushalt'], emoji: '🔍' },
  'Wahre Kriminalfälle':    { genre: 'True Crime',   moods: ['spannend'],            situations: ['autofahrt', 'haushalt'], emoji: '🔍' },
  'Geldanlage':             { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt'],             emoji: '💶' },
  'Wirtschaftsnachrichten': { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt'],             emoji: '📈' },
  'Sportnews':              { genre: 'Gesellschaft', moods: ['lernen'],              situations: ['sport', 'autofahrt'],    emoji: '⚽' },
  'Philosophie':            { genre: 'Wissenschaft', moods: ['lernen', 'entspannen'],situations: ['haushalt', 'lange'],     emoji: '🦉' },
  'Comedy':                 { genre: 'Comedy',       moods: ['lustig'],              situations: ['haushalt', 'sport'],     emoji: '😄' },
  'Comedy-Interviews':      { genre: 'Comedy',       moods: ['lustig'],              situations: ['haushalt', 'autofahrt'], emoji: '🎤' },
  'Nachrichten':            { genre: 'Gesellschaft', moods: ['lernen'],              situations: ['autofahrt', 'haushalt'], emoji: '🗞️' },
  'Nachrichten des Tages':  { genre: 'Gesellschaft', moods: ['lernen'],              situations: ['autofahrt'],             emoji: '🗞️' },
  'Politik':                { genre: 'Gesellschaft', moods: ['lernen'],              situations: ['autofahrt'],             emoji: '🏛️' },
  'Wissenschaft':           { genre: 'Wissenschaft', moods: ['lernen'],              situations: ['autofahrt', 'haushalt'], emoji: '🔬' },
  'Gesellschaft und Kultur':{ genre: 'Gesellschaft', moods: ['lernen', 'entspannen'],situations: ['haushalt'],              emoji: '🎭' },
  'Persönliche Tagebücher': { genre: 'Gesellschaft', moods: ['entspannen'],          situations: ['haushalt'],              emoji: '📔' },
  'Dokumentation':          { genre: 'Gesellschaft', moods: ['lernen', 'spannend'],  situations: ['autofahrt'],             emoji: '🎬' },
  'Wirtschaft':             { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt', 'sport'],    emoji: '📈' },
  'Firmengründung':         { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt', 'sport'],    emoji: '🚀' },
  'Investment':             { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt'],             emoji: '💶' },
  'Sport':                  { genre: 'Gesellschaft', moods: ['lustig', 'lernen'],    situations: ['sport', 'autofahrt'],    emoji: '⚽' },
  'Fußball':                { genre: 'Gesellschaft', moods: ['lustig', 'lernen'],    situations: ['sport', 'autofahrt'],    emoji: '⚽' },
  'Gesundheit und Fitness': { genre: 'Achtsamkeit',  moods: ['entspannen', 'lernen'],situations: ['sport'],                 emoji: '🧘' },
  'Mentale Gesundheit':     { genre: 'Achtsamkeit',  moods: ['entspannen'],          situations: ['einschlafen'],           emoji: '🌿' },
  'Bildung':                { genre: 'Wissenschaft', moods: ['lernen'],              situations: ['autofahrt', 'haushalt'], emoji: '🎓' },
  'Selbstverwirklichung':   { genre: 'Achtsamkeit',  moods: ['lernen', 'entspannen'],situations: ['sport'],                 emoji: '🌱' },
  'Geschichte':             { genre: 'Geschichte',   moods: ['lernen', 'spannend'],  situations: ['autofahrt', 'lange'],    emoji: '🏺' },
  'Kinder und Familie':     { genre: 'Kinder',       moods: ['lustig'],              situations: ['einschlafen'],           emoji: '🧸' },
  'Fiktion':                { genre: 'Krimi',        moods: ['spannend', 'lange'],   situations: ['einschlafen', 'lange'],  emoji: '📖' },
  'Drama':                  { genre: 'Krimi',        moods: ['spannend'],            situations: ['lange'],                 emoji: '🎭' },
  'Technologie':            { genre: 'Wirtschaft',   moods: ['lernen'],              situations: ['autofahrt'],             emoji: '💻' },
  'TV und Film':            { genre: 'Comedy',       moods: ['lustig', 'entspannen'],situations: ['haushalt'],              emoji: '🍿' },
  'Musik':                  { genre: 'Gesellschaft', moods: ['entspannen'],          situations: ['haushalt'],              emoji: '🎵' },
  'Freizeit':               { genre: 'Gesellschaft', moods: ['lustig', 'entspannen'],situations: ['haushalt'],              emoji: '🎲' },
  'Beziehungen':            { genre: 'Gesellschaft', moods: ['entspannen', 'lustig'],situations: ['haushalt'],              emoji: '💬' },
}
const FALLBACK = { genre: 'Gesellschaft', moods: ['lernen'], situations: ['autofahrt'], emoji: '🎙️' }

const parser = new XMLParser({ ignoreAttributes: false, textNodeName: 'text' })

const strip = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const text = (v) => (v && typeof v === 'object' ? v.text ?? v['#text'] ?? '' : v ?? '')

function parseDurationMin(raw) {
  const s = String(text(raw) ?? '').trim()
  if (!s) return null
  if (/^\d+$/.test(s)) return Math.max(1, Math.round(Number(s) / 60))
  const parts = s.split(':').map(Number)
  if (parts.some(Number.isNaN)) return null
  const sec = parts.reduce((acc, p) => acc * 60 + p, 0)
  return Math.max(1, Math.round(sec / 60))
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Audiora/0.1 (Metadaten-Import)' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function fetchFeed(url, ms = 12000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'Audiora/0.1 (Metadaten-Import)' } })
    if (!res.ok) throw new Error(`${res.status}`)
    return parser.parse(await res.text())
  } finally {
    clearTimeout(t)
  }
}

function hueFromString(s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.codePointAt(0)) % 360
  return h
}

const charts = (await fetchJson(CHARTS)).feed.results
console.log(`Charts: ${charts.length} Podcasts`)

const lookup = await fetchJson(`https://itunes.apple.com/lookup?id=${charts.map((c) => c.id).join(',')}&country=de`)
const byLookupId = new Map(lookup.results.map((r) => [String(r.collectionId ?? r.trackId), r]))

const out = []
let rank = 0
for (const c of charts) {
  rank += 1
  const lu = byLookupId.get(String(c.id)) || {}
  const genreNames = (lu.genres || c.genres.map((g) => g.name)).filter((g) => g !== 'Podcasts')
  const mapped = genreNames.map((g) => GENRE_MAP[g]).filter(Boolean)
  const primary = mapped[0] || FALLBACK

  let desc = ''
  let latest = []
  let avgDuration = null
  if (lu.feedUrl) {
    try {
      const feed = await fetchFeed(lu.feedUrl)
      const ch = feed?.rss?.channel
      if (ch) {
        desc = strip(text(ch['itunes:summary']) || text(ch.description))
        const feedItems = (Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : []).slice(0, 3)
        latest = feedItems.map((it) => ({
          title: strip(text(it.title)),
          date: text(it.pubDate) ? new Date(text(it.pubDate)).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
          duration: parseDurationMin(it['itunes:duration']),
        }))
        const durs = latest.map((e) => e.duration).filter(Boolean)
        if (durs.length) avgDuration = Math.round(durs.reduce((a, b) => a + b, 0) / durs.length)
      }
    } catch (e) {
      console.warn(`  RSS übersprungen (${c.name}): ${e.message}`)
    }
  }
  if (desc.length > 300) desc = desc.slice(0, 297).trimEnd() + '…'

  out.push({
    id: `it-${c.id}`,
    type: 'podcast',
    real: true,
    chartRank: rank,
    title: c.name,
    by: c.artistName,
    year: lu.releaseDate ? Number(lu.releaseDate.slice(0, 4)) : null,
    episodes: lu.trackCount ?? null,
    duration: avgDuration,
    image: lu.artworkUrl600 || c.artworkUrl100.replace('100x100', '600x600'),
    hue: hueFromString(c.name),
    emoji: primary.emoji,
    genres: [...new Set(mapped.map((m) => m.genre))].slice(0, 2).length
      ? [...new Set(mapped.map((m) => m.genre))].slice(0, 2)
      : [FALLBACK.genre],
    moods: [...new Set(mapped.flatMap((m) => m.moods))].slice(0, 3).length
      ? [...new Set(mapped.flatMap((m) => m.moods))].slice(0, 3)
      : FALLBACK.moods,
    situations: [...new Set(mapped.flatMap((m) => m.situations))].slice(0, 3).length
      ? [...new Set(mapped.flatMap((m) => m.situations))].slice(0, 3)
      : FALLBACK.situations,
    topics: genreNames.slice(0, 4),
    desc: desc || `${c.name} – Podcast von ${c.artistName}.`,
    latest,
    platforms: ['apple', 'spotify', 'youtube'],
    links: {
      apple: lu.trackViewUrl || c.url,
      spotify: `https://open.spotify.com/search/${encodeURIComponent(c.name)}`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(c.name + ' podcast')}`,
    },
  })
  console.log(`  ${String(rank).padStart(2)}. ${c.name} ${desc ? '✓' : '(ohne RSS-Beschreibung)'}`)
}

writeFileSync(new URL('../src/real-podcasts.json', import.meta.url), JSON.stringify(out, null, 2))
console.log(`\n${out.length} Podcasts → src/real-podcasts.json`)
