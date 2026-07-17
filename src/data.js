// ── Audiora Datenbank ───────────────────────────────────────────────────
// Alles ist ein Audio-Objekt. Alles ist verbunden.
// Echte Podcast-Daten (Apple-Charts + RSS) kommen aus real-podcasts.json,
// erzeugt von scripts/import-podcasts.mjs. Hörbücher/Hörspiele sind kuratiert.

import realPodcasts from './real-podcasts.json'
import realAudiobooks from './real-audiobooks.json'
import realLibrivox from './real-librivox.json'
import media from './media.json'

// Logos: echte Markenlogos via simple-icons-CDN, sonst Lettermark in Markenfarbe
export const PLATFORMS = {
  spotify:   { name: 'Spotify',        logo: 'https://cdn.simpleicons.org/spotify/1DB954' },
  audible:   { name: 'Audible',        logo: 'https://cdn.simpleicons.org/audible/F8991C' },
  apple:     { name: 'Apple Podcasts', logo: 'https://cdn.simpleicons.org/applepodcasts/9933CC' },
  youtube:   { name: 'YouTube',        logo: 'https://cdn.simpleicons.org/youtube/FF0000' },
  ard:       { name: 'ARD Audiothek',  color: '#0f4ea3' },
  podimo:    { name: 'Podimo',         color: '#5a31f4' },
  bookbeat:  { name: 'BookBeat',       color: '#f5c518' },
  nextory:   { name: 'Nextory',        color: '#e6455a' },
  librivox:  { name: 'LibriVox',       color: '#7a9e4f' },
  applebooks:{ name: 'Apple Books',    logo: 'https://cdn.simpleicons.org/apple/F28C3A' },
}

export const TYPE_LABEL = {
  podcast: 'Podcast', folge: 'Podcastfolge', hoerbuch: 'Hörbuch',
  hoerspiel: 'Hörspiel', meditation: 'Meditation', wissen: 'Wissensformat',
  kinder: 'Kindergeschichte', doku: 'Dokumentation', sprachkurs: 'Sprachkurs',
  einschlafen: 'Einschlafgeschichte',
}

export const MOODS = [
  { id: 'spannend',   emoji: '⚡', label: 'Spannend' },
  { id: 'entspannen', emoji: '😌', label: 'Entspannen' },
  { id: 'lustig',     emoji: '😂', label: 'Lustig' },
  { id: 'lernen',     emoji: '🧠', label: 'Lernen' },
  { id: 'autofahrt',  emoji: '🚗', label: 'Autofahrt' },
  { id: 'einschlafen',emoji: '😴', label: 'Einschlafen' },
  { id: 'sport',      emoji: '🏃', label: 'Sport' },
  { id: 'haushalt',   emoji: '🧹', label: 'Haushalt' },
  { id: 'lange',      emoji: '📚', label: 'Lange Geschichten' },
]

export const GENRES = ['Fantasy', 'True Crime', 'Science-Fiction', 'Krimi', 'Comedy', 'Wissenschaft', 'Wirtschaft', 'Geschichte', 'Thriller', 'Kinder', 'Achtsamkeit', 'Gesellschaft']

// ── Personen ────────────────────────────────────────────────────────────
export const people = [
  { id: 'p-rufus',    name: 'Rufus Beck',        role: 'Sprecher', claimed: false, hue: 28,  bio: 'Einer der bekanntesten Hörbuchsprecher Deutschlands. Seine Interpretation der Harry-Potter-Reihe gilt als Maßstab des Genres.' },
  { id: 'p-kaminski', name: 'Stefan Kaminski',   role: 'Sprecher', claimed: false, hue: 200, bio: 'Vielfach ausgezeichneter Sprecher und Stimmkünstler, bekannt für lebendige Mehrstimmigkeit.' },
  { id: 'p-nachtmann',name: 'Julia Nachtmann',   role: 'Sprecherin', claimed: true, hue: 320, bio: 'Hamburger Schauspielerin und Sprecherin mit ruhiger, warmer Stimme – perfekt für lange Abende.' },
  { id: 'p-herbert',  name: 'Frank Herbert',     role: 'Autor',    claimed: false, hue: 40,  bio: 'US-amerikanischer Science-Fiction-Autor. Sein Epos „Der Wüstenplanet“ prägte das Genre wie kaum ein zweites Werk.' },
  { id: 'p-funke',    name: 'Cornelia Funke',    role: 'Autorin',  claimed: false, hue: 150, bio: 'Deutschlands erfolgreichste Kinder- und Fantasy-Autorin („Tintenherz“, „Drachenreiter“).' },
  { id: 'p-fitzek',   name: 'Sebastian Fitzek',  role: 'Autor',    claimed: true,  hue: 0,   bio: 'Deutschlands erfolgreichster Thriller-Autor. Seine Psychothriller sind als Hörbücher regelmäßig auf Platz 1.' },
  { id: 'p-tolkien',  name: 'J.R.R. Tolkien',    role: 'Autor',    claimed: false, hue: 120, bio: 'Begründer der modernen Fantasy. „Der Herr der Ringe“ ist das Referenzwerk epischer Weltenbauten.' },
]

// ── Audio-Objekte (kuratiert) ───────────────────────────────────────────
export const curated = [
  {
    id: 'dune', type: 'hoerbuch', title: 'Dune – Der Wüstenplanet', by: 'Frank Herbert',
    authorId: 'p-herbert', speakerIds: ['p-kaminski'], year: 2020, duration: 1220,
    hue: 32, emoji: '🏜️',
    genres: ['Science-Fiction'], moods: ['spannend', 'lange'], situations: ['autofahrt', 'lange'],
    topics: ['Weltraum', 'Politik', 'Ökologie'], platforms: ['audible', 'spotify', 'bookbeat'],
    desc: 'Der Wüstenplanet Arrakis, das Spice und der Aufstieg des Paul Atreides – Stefan Kaminski erweckt Herberts Epos mit dutzenden Stimmen zum Leben.',
    voice: 'männlich, wandelbar',
  },
  {
    id: 'herr-der-ringe', type: 'hoerbuch', title: 'Der Herr der Ringe – Die Gefährten', by: 'J.R.R. Tolkien',
    authorId: 'p-tolkien', speakerIds: ['p-kaminski'], year: 2021, duration: 1440,
    hue: 130, emoji: '💍',
    genres: ['Fantasy'], moods: ['spannend', 'lange'], situations: ['lange', 'autofahrt'],
    topics: ['Mittelerde', 'Freundschaft', 'Epos'], platforms: ['audible', 'bookbeat', 'nextory'],
    desc: 'Die ungekürzte Lesung des Fantasy-Klassikers – episch, dicht und mit über 24 Stunden die perfekte lange Geschichte.',
    voice: 'männlich, episch',
  },
  {
    id: 'tintenherz', type: 'hoerbuch', title: 'Tintenherz', by: 'Cornelia Funke',
    authorId: 'p-funke', speakerIds: ['p-rufus'], year: 2019, duration: 640,
    hue: 355, emoji: '🕯️',
    genres: ['Fantasy', 'Kinder'], moods: ['spannend', 'lange'], situations: ['lange', 'einschlafen'],
    topics: ['Bücher', 'Magie', 'Familie'], platforms: ['audible', 'spotify', 'bookbeat', 'nextory'],
    desc: 'Wer laut liest, kann Figuren aus Büchern in die Wirklichkeit holen. Rufus Beck liest Funkes moderne Klassikerin der Fantasy.',
    voice: 'männlich, warm',
  },
  {
    id: 'harry-erwachsen', type: 'hoerbuch', title: 'Der Name des Windes', by: 'Patrick Rothfuss',
    authorId: null, speakerIds: ['p-kaminski'], year: 2018, duration: 1690,
    hue: 260, emoji: '🌬️',
    genres: ['Fantasy'], moods: ['spannend', 'lange'], situations: ['lange'],
    topics: ['Magie-Universität', 'Musik', 'Legenden'], platforms: ['audible', 'bookbeat'],
    desc: 'Magie, eine Universität für Arkanisten und ein Held mit dunkler Legende – Fantasy wie Harry Potter, nur erwachsener.',
    voice: 'männlich, erzählend', likeHarry: true,
  },
  {
    id: 'drei-fragezeichen', type: 'hoerspiel', title: 'Die drei ??? – Folge 2: Das Geisterschloss', by: 'Europa',
    speakerIds: [], year: 2024, duration: 72,
    hue: 205, emoji: '❓',
    genres: ['Krimi', 'Kinder'], moods: ['spannend'], situations: ['autofahrt', 'einschlafen'],
    topics: ['Detektive', 'Rocky Beach'], platforms: ['spotify', 'apple', 'youtube', 'bookbeat'],
    desc: 'Justus, Peter und Bob ermitteln im Geisterschloss – ein Klassiker des dienstältesten Hörspiel-Trios Deutschlands.',
  },
  {
    id: 'augenzeuge', type: 'hoerbuch', title: 'Der Augensammler', by: 'Sebastian Fitzek',
    authorId: 'p-fitzek', speakerIds: ['p-nachtmann'], year: 2021, duration: 560,
    hue: 0, emoji: '👁️',
    genres: ['Thriller'], moods: ['spannend'], situations: ['autofahrt'],
    topics: ['Psychothriller', 'Berlin'], platforms: ['audible', 'bookbeat', 'nextory', 'spotify'],
    desc: 'Ein Entführer, der mit der Zeit spielt. Fitzeks Psychothriller als atemlose Lesung – nichts für schwache Nerven.',
    voice: 'weiblich, ruhig',
  },
  {
    id: 'drachenreiter', type: 'kinder', title: 'Drachenreiter', by: 'Cornelia Funke',
    authorId: 'p-funke', speakerIds: ['p-rufus'], year: 2020, duration: 380,
    hue: 160, emoji: '🐉',
    genres: ['Fantasy', 'Kinder'], moods: ['spannend', 'lange'], situations: ['einschlafen', 'lange'],
    topics: ['Drachen', 'Abenteuer'], platforms: ['audible', 'spotify', 'bookbeat'],
    desc: 'Der junge Drache Lung sucht den Saum des Himmels – Funkes Abenteuer für die ganze Familie.',
    voice: 'männlich, warm',
  },
]

// Echte Cover (iTunes) und Personenfotos (Wikipedia) aus media.json anreichern
curated.forEach((i) => { if (media.covers[i.id]) i.image = media.covers[i.id] })
people.forEach((p) => { if (media.people[p.id]) p.image = media.people[p.id] })

// Echte Top-Podcasts, Hörbuch-Charts, freie Klassiker + kuratierte Titel –
// alles ein einheitliches Datenmodell
export const items = [...realPodcasts, ...realAudiobooks, ...realLibrivox, ...curated]

// Podcastauftritte werden künftig aus echten Feeds abgeleitet
export const episodes = []

// ── Hilfsfunktionen ─────────────────────────────────────────────────────
export const byId = (id) => items.find((i) => i.id === id)
export const personById = (id) => people.find((p) => p.id === id)

export function fmtDuration(min) {
  if (min == null) return ''
  if (min >= 60) {
    const h = Math.floor(min / 60), m = min % 60
    return m ? `${h} Std. ${m} Min.` : `${h} Std.`
  }
  return `${min} Min.`
}

export function similarTo(item, n = 6) {
  return items
    .filter((i) => i.id !== item.id)
    .map((i) => {
      let s = 0
      s += i.genres.filter((g) => item.genres.includes(g)).length * 3
      s += i.moods.filter((m) => item.moods.includes(m)).length * 2
      s += (i.topics || []).filter((t) => (item.topics || []).includes(t)).length * 2
      if (i.authorId && i.authorId === item.authorId) s += 4
      if ((i.speakerIds || []).some((sp) => (item.speakerIds || []).includes(sp))) s += 3
      return [i, s]
    })
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([i]) => i)
}

// KI-Empfehlungsbegründung
export function explainRecommendation(item) {
  const reasons = []
  if (item.genres.includes('Fantasy')) reasons.push('Fantasy')
  if (item.genres.includes('Science-Fiction')) reasons.push('Science-Fiction')
  if (item.moods.includes('lange')) reasons.push('lange Geschichten')
  if ((item.voice || '').includes('ruhig')) reasons.push('ruhige Sprecherstimmen')
  if (item.moods.includes('lernen')) reasons.push('Wissensformate')
  if (!reasons.length) reasons.push(item.genres[0])
  return `Wir empfehlen dir diesen Titel, weil du ${reasons.slice(0, 3).join(', ').replace(/, ([^,]*)$/, ' und $1')} magst.`
}

// ── Natürlichsprachige Suche ────────────────────────────────────────────
export function smartSearch(query) {
  const q = query.toLowerCase()
  const signals = []
  let pool = [...items]

  const has = (...words) => words.some((w) => q.includes(w))

  // Dauer: "eine stunde", "60 minuten", "kurz"
  if (has('stunde', '1h', '60 min')) {
    signals.push({ label: '≈ 1 Stunde', type: 'dauer' })
    pool = pool.map((i) => [i, i.duration >= 35 && i.duration <= 120 ? 3 : 0])
  } else pool = pool.map((i) => [i, 0])

  const boost = (fn, pts, label, type) => {
    let hit = false
    pool = pool.map(([i, s]) => {
      const b = fn(i) ? pts : 0
      if (b) hit = true
      return [i, s + b]
    })
    if (hit && label) signals.push({ label, type })
  }

  if (has('spannend', 'spannung', 'nervenkitzel')) boost((i) => i.moods.includes('spannend'), 4, '⚡ Spannend', 'stimmung')
  if (has('entspann', 'ruhig', 'beruhig')) boost((i) => i.moods.includes('entspannen') || (i.voice || '').includes('ruhig'), 4, '😌 Entspannend', 'stimmung')
  if (has('lustig', 'lachen', 'comedy', 'witzig')) boost((i) => i.moods.includes('lustig'), 5, '😂 Lustig', 'stimmung')
  if (has('einschlaf', 'schlafen', 'nacht')) boost((i) => i.moods.includes('einschlafen'), 5, '😴 Zum Einschlafen', 'situation')
  if (has('autofahrt', 'auto', 'unterwegs', 'fahrt')) boost((i) => i.situations.includes('autofahrt'), 4, '🚗 Autofahrt', 'situation')
  if (has('sport', 'laufen', 'joggen')) boost((i) => i.situations.includes('sport'), 4, '🏃 Sport', 'situation')
  if (has('lernen', 'wissen', 'verstehen')) boost((i) => i.moods.includes('lernen'), 4, '🧠 Lernen', 'stimmung')

  if (has('harry potter')) {
    boost((i) => i.likeHarry || i.genres.includes('Fantasy'), 5, '✨ Wie Harry Potter', 'aehnlich')
    if (has('erwachsen')) boost((i) => i.likeHarry, 6, 'für Erwachsene', 'aehnlich')
  }
  if (has('true crime', 'crime', 'kriminal')) boost((i) => i.genres.includes('True Crime') || (i.topics || []).includes('Wahre Kriminalfälle'), 6, '🔍 True Crime', 'genre')
  if (has('ohne brutal', 'nicht brutal', 'ohne gewalt')) boost((i) => i.gentle, 6, 'ohne brutale Details', 'filter')
  if (has('fantasy')) boost((i) => i.genres.includes('Fantasy'), 6, '🐉 Fantasy', 'genre')
  if (has('sci-fi', 'science')) boost((i) => i.genres.includes('Science-Fiction'), 6, '🪐 Science-Fiction', 'genre')
  if (has('thriller')) boost((i) => i.genres.includes('Thriller'), 6, 'Thriller', 'genre')
  if (has('startup', 'gründ', 'unternehm')) boost((i) => i.genres.includes('Wirtschaft') || (i.topics || []).some((t) => ['Startups', 'Firmengründung', 'Wirtschaft', 'Investment', 'Technologie'].includes(t)), 6, '🚀 Startups & Wirtschaft', 'thema')
  if (has('männlich')) boost((i) => (i.voice || '').includes('männlich'), 4, 'männliche Stimme', 'stimme')
  if (has('weiblich')) boost((i) => (i.voice || '').includes('weiblich'), 4, 'weibliche Stimme', 'stimme')
  if (has('ruhige') && has('stimme')) boost((i) => (i.voice || '').includes('ruhig'), 4, 'ruhige Stimme', 'stimme')
  if (has('hörbuch', 'hoerbuch')) boost((i) => i.type === 'hoerbuch', 3, 'Hörbücher', 'format')
  if (has('podcast')) boost((i) => ['podcast', 'wissen'].includes(i.type), 3, 'Podcasts', 'format')
  if (has('hörspiel', 'hoerspiel')) boost((i) => i.type === 'hoerspiel', 4, 'Hörspiele', 'format')
  if (has('kinder')) boost((i) => i.genres.includes('Kinder') || i.type === 'kinder', 5, 'für Kinder', 'filter')
  if (has('lange geschichte', 'episch', 'lang')) boost((i) => i.moods.includes('lange'), 3, '📚 Lange Geschichten', 'stimmung')
  if (has('meditation', 'achtsam')) boost((i) => ['meditation'].includes(i.type) || i.genres.includes('Achtsamkeit'), 5, '🍃 Achtsamkeit', 'genre')
  if (has('geschichte', 'histor')) boost((i) => i.genres.includes('Geschichte'), 4, '🏛️ Geschichte', 'genre')

  // Volltext auf Titel / Personen / Themen
  const words = q.split(/\s+/).filter((w) => w.length > 3)
  pool = pool.map(([i, s]) => {
    const text = `${i.title} ${i.by} ${(i.topics || []).join(' ')} ${i.genres.join(' ')}`.toLowerCase()
    const hits = words.filter((w) => text.includes(w)).length
    return [i, s + hits * 2]
  })

  const scored = pool.filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1])
  // Echte Treffer vollständig zurückgeben (damit Filter genug Material haben);
  // nur der „Vielleicht gefällt dir"-Fallback ohne Treffer bleibt begrenzt.
  const results = scored.length
    ? scored.map(([i]) => i)
    : pool.sort((a, b) => (b[0].rating || 0) - (a[0].rating || 0)).slice(0, 12).map(([i]) => i)

  // Personen-Treffer
  const persons = people.filter((p) => p.name.toLowerCase().includes(q) || words.some((w) => p.name.toLowerCase().includes(w)))

  return { results, signals, persons }
}

// ── Audio Graph ─────────────────────────────────────────────────────────
// Baut Knoten + Kanten rund um einen Titel
export function buildGraph(itemId) {
  const center = byId(itemId)
  if (!center) return { nodes: [], links: [] }
  const nodes = [{ id: center.id, label: center.title, kind: 'titel', ref: center }]
  const links = []
  const add = (node, relation) => {
    if (!nodes.find((n) => n.id === node.id)) nodes.push(node)
    links.push({ source: center.id, target: node.id, relation })
  }

  if (center.authorId) {
    const a = personById(center.authorId)
    add({ id: a.id, label: a.name, kind: 'person', sub: a.role, ref: a }, 'Autor')
  }
  ;(center.speakerIds || []).forEach((sid) => {
    const s = personById(sid)
    add({ id: s.id, label: s.name, kind: 'person', sub: s.role, ref: s }, 'Sprecher')
  })
  ;(center.hostIds || []).forEach((hid) => {
    const h = personById(hid)
    add({ id: h.id, label: h.name, kind: 'person', sub: h.role, ref: h }, 'Host')
  })
  // Echte Podcasts: Host/Produzent aus den Importdaten
  if (center.real && center.by) {
    add({ id: `artist-${center.id}`, label: center.by, kind: 'person', sub: 'Host / Produktion', search: center.by }, 'Host')
  }
  center.genres.forEach((g) => add({ id: `g-${g}`, label: g, kind: 'genre' }, 'Genre'))
  ;(center.topics || []).slice(0, 3).forEach((t) => add({ id: `t-${t}`, label: t, kind: 'thema' }, 'Thema'))
  center.moods.slice(0, 2).forEach((m) => {
    const mood = MOODS.find((x) => x.id === m)
    if (mood) add({ id: `m-${m}`, label: `${mood.emoji} ${mood.label}`, kind: 'stimmung' }, 'Stimmung')
  })
  center.platforms.forEach((p) => add({ id: `pf-${p}`, label: PLATFORMS[p].name, kind: 'plattform' }, 'Verfügbar bei'))
  similarTo(center, 4).forEach((s) => add({ id: s.id, label: s.title, kind: 'titel', ref: s }, 'Ähnlich'))
  // (Community-Listen-Knoten kommen, sobald der Graph an die Live-Listen angebunden ist)

  // Zweite Ebene: Sprecher ↔ weitere Hörbücher
  ;(center.speakerIds || []).forEach((sid) => {
    items.filter((i) => i.id !== center.id && (i.speakerIds || []).includes(sid)).slice(0, 3).forEach((i) => {
      if (!nodes.find((n) => n.id === i.id)) nodes.push({ id: i.id, label: i.title, kind: 'titel', ref: i })
      links.push({ source: sid, target: i.id, relation: 'liest auch' })
    })
  })
  // Autor ↔ Podcastauftritte
  episodes.forEach((ep) => {
    ;(ep.guestIds || []).forEach((gid) => {
      if (nodes.find((n) => n.id === gid)) {
        const parent = byId(ep.parent)
        if (parent && !nodes.find((n) => n.id === parent.id)) nodes.push({ id: parent.id, label: parent.title, kind: 'titel', ref: parent })
        if (parent) links.push({ source: gid, target: parent.id, relation: 'zu Gast bei' })
      }
    })
  })
  return { nodes, links, centerId: center.id }
}
