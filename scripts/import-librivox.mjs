// Importiert gemeinfreie deutsche Hörbuch-Klassiker von LibriVox – kostenlos & legal,
// inklusive Link zum vollständigen, frei hörbaren Audio.
// Ausgabe: src/real-librivox.json

import { writeFileSync } from 'node:fs'

// match: Substring, der im LibriVox-Katalogtitel vorkommen muss (deutschsprachige Aufnahme)
const CLASSICS = [
  { title: 'Die Verwandlung',        match: 'Verwandlung', author: 'Kafka',     emoji: '🪲', topics: ['Kafka', 'Novelle'] },
  { title: 'Der Sandmann',           match: 'Sandmann',    author: 'Hoffmann',  emoji: '🌑', topics: ['Romantik', 'Schauergeschichte'] },
  { title: 'Effi Briest',            match: 'Effi',        author: 'Fontane',   emoji: '🌾', topics: ['Realismus', 'Gesellschaftsroman'] },
  { title: 'Die Leiden des jungen Werther', match: 'Werther', author: 'Goethe', emoji: '💌', topics: ['Sturm und Drang', 'Briefroman'] },
  { title: 'Also sprach Zarathustra',match: 'Zarathustra', author: 'Nietzsche', emoji: '⛰️', topics: ['Philosophie'] },
  { title: 'Kinder- und Hausmärchen',match: 'Märchen',     author: 'Grimm',     emoji: '🏰', topics: ['Märchen', 'Für Kinder'] },
  { title: 'Der Tod in Venedig',     match: 'Venedig',     author: 'Mann',      emoji: '🌊', topics: ['Novelle'] },
  { title: 'Traumnovelle',           match: 'Traumnovelle',author: 'Schnitzler',emoji: '🎭', topics: ['Wiener Moderne'] },
]

const headers = { 'user-agent': 'Audiora/0.1 (Metadaten-Import)' }

const strip = (html) =>
  String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

const hueFromString = (s) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.codePointAt(0)) % 360
  return h
}

const toMinutes = (t) => {
  const p = String(t || '').split(':').map(Number)
  if (p.length !== 3 || p.some(Number.isNaN)) return null
  return p[0] * 60 + p[1] + Math.round(p[2] / 60)
}

const out = []
for (const c of CLASSICS) {
  try {
    const url = `https://librivox.org/api/feed/audiobooks/?format=json&limit=50&extended=1&author=${encodeURIComponent(c.author)}`
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(25000) })
    if (!res.ok) throw new Error(res.status)
    const books = (await res.json()).books || []
    const book = books.find(
      (b) =>
        b.language === 'German' &&
        b.title.toLowerCase().includes(c.match.toLowerCase()) &&
        (b.authors || []).some((a) => (a.last_name || '').includes(c.author)),
    )
    if (!book) { console.warn(`– nicht gefunden: ${c.title}`); continue }
    const authorName = `${book.authors[0].first_name} ${book.authors[0].last_name}`.trim()
    let desc = strip(book.description)
    if (desc.length > 260) desc = desc.slice(0, 257).trimEnd() + '…'
    out.push({
      id: `lv-${book.id}`,
      type: 'hoerbuch',
      real: true,
      free: true,
      title: c.title,
      by: authorName,
      year: Number(book.copyright_year) || null,
      duration: toMinutes(book.totaltime),
      image: book.coverart_jpg || null,
      hue: hueFromString(c.title),
      emoji: c.emoji,
      genres: ['Klassiker'],
      moods: ['lange', 'entspannen'],
      situations: ['einschlafen', 'lange'],
      topics: ['Gemeinfrei', ...c.topics],
      desc: desc || `${c.title} von ${authorName} – gemeinfreier Klassiker, komplett und kostenlos hörbar.`,
      platforms: ['librivox'],
      links: { librivox: book.url_librivox },
    })
    console.log(`✓ ${c.title} — ${authorName} (${book.totaltime})`)
  } catch (e) {
    console.warn(`– ${c.title} fehlgeschlagen: ${e.message}`)
  }
}

writeFileSync(new URL('../src/real-librivox.json', import.meta.url), JSON.stringify(out, null, 2))
console.log(`\n${out.length} Klassiker → src/real-librivox.json`)
