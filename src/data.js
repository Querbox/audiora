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
  { id: 'p-eckert',   name: 'Linn Eckert',       role: 'Host',     claimed: false, hue: 265, bio: 'Journalistin und Podcasterin. Host von „Dunkle Akten“ – True Crime mit Haltung und ohne Effekthascherei.' },
  { id: 'p-brandt',   name: 'Jonas Brandt',      role: 'Host',     claimed: false, hue: 190, bio: 'Gründer, Investor und Host von „Gründerzeit“. Spricht wöchentlich mit den spannendsten Startups des Landes.' },
  { id: 'p-yogi',     name: 'Mara Weidner',      role: 'Creatorin',claimed: false, hue: 95,  bio: 'Meditationslehrerin. Ihre Einschlaf-Reisen gehören zu den meistgehörten Deutschlands.' },
  { id: 'p-tolkien',  name: 'J.R.R. Tolkien',    role: 'Autor',    claimed: false, hue: 120, bio: 'Begründer der modernen Fantasy. „Der Herr der Ringe“ ist das Referenzwerk epischer Weltenbauten.' },
  { id: 'p-lauer',    name: 'Prof. Anna Lauer',  role: 'Gast',     claimed: false, hue: 220, bio: 'Astrophysikerin und gefragte Podcast-Gästin zu allem, was das Universum hergibt.' },
]

// ── Audio-Objekte (kuratiert) ───────────────────────────────────────────
export const curated = [
  {
    id: 'dune', type: 'hoerbuch', title: 'Dune – Der Wüstenplanet', by: 'Frank Herbert',
    authorId: 'p-herbert', speakerIds: ['p-kaminski'], year: 2020, duration: 1220,
    rating: 4.8, ratings: 12840, hue: 32, emoji: '🏜️',
    genres: ['Science-Fiction'], moods: ['spannend', 'lange'], situations: ['autofahrt', 'lange'],
    topics: ['Weltraum', 'Politik', 'Ökologie'], platforms: ['audible', 'spotify', 'bookbeat'],
    desc: 'Der Wüstenplanet Arrakis, das Spice und der Aufstieg des Paul Atreides – Stefan Kaminski erweckt Herberts Epos mit dutzenden Stimmen zum Leben.',
    voice: 'männlich, wandelbar',
  },
  {
    id: 'herr-der-ringe', type: 'hoerbuch', title: 'Der Herr der Ringe – Die Gefährten', by: 'J.R.R. Tolkien',
    authorId: 'p-tolkien', speakerIds: ['p-kaminski'], year: 2021, duration: 1440,
    rating: 4.9, ratings: 18220, hue: 130, emoji: '💍',
    genres: ['Fantasy'], moods: ['spannend', 'lange'], situations: ['lange', 'autofahrt'],
    topics: ['Mittelerde', 'Freundschaft', 'Epos'], platforms: ['audible', 'bookbeat', 'nextory'],
    desc: 'Die ungekürzte Lesung des Fantasy-Klassikers – episch, dicht und mit über 24 Stunden die perfekte lange Geschichte.',
    voice: 'männlich, episch',
  },
  {
    id: 'tintenherz', type: 'hoerbuch', title: 'Tintenherz', by: 'Cornelia Funke',
    authorId: 'p-funke', speakerIds: ['p-rufus'], year: 2019, duration: 640,
    rating: 4.7, ratings: 9300, hue: 355, emoji: '🕯️',
    genres: ['Fantasy', 'Kinder'], moods: ['spannend', 'lange'], situations: ['lange', 'einschlafen'],
    topics: ['Bücher', 'Magie', 'Familie'], platforms: ['audible', 'spotify', 'bookbeat', 'nextory'],
    desc: 'Wer laut liest, kann Figuren aus Büchern in die Wirklichkeit holen. Rufus Beck liest Funkes moderne Klassikerin der Fantasy.',
    voice: 'männlich, warm',
  },
  {
    id: 'harry-erwachsen', type: 'hoerbuch', title: 'Der Name des Windes', by: 'Patrick Rothfuss',
    authorId: null, speakerIds: ['p-kaminski'], year: 2018, duration: 1690,
    rating: 4.8, ratings: 15400, hue: 260, emoji: '🌬️',
    genres: ['Fantasy'], moods: ['spannend', 'lange'], situations: ['lange'],
    topics: ['Magie-Universität', 'Musik', 'Legenden'], platforms: ['audible', 'bookbeat'],
    desc: 'Magie, eine Universität für Arkanisten und ein Held mit dunkler Legende – Fantasy wie Harry Potter, nur erwachsener.',
    voice: 'männlich, erzählend', likeHarry: true,
  },
  {
    id: 'dunkle-akten', type: 'podcast', title: 'Dunkle Akten', by: 'Linn Eckert',
    hostIds: ['p-eckert'], year: 2023, duration: 55, episodes: 142,
    rating: 4.6, ratings: 21050, hue: 275, emoji: '🗂️',
    genres: ['True Crime'], moods: ['spannend'], situations: ['autofahrt', 'haushalt'],
    topics: ['Ermittlungen', 'Justiz', 'Deutschland'], platforms: ['spotify', 'apple', 'podimo'],
    desc: 'True Crime ohne Effekthascherei: Linn Eckert rekonstruiert reale Fälle mit Respekt für die Betroffenen – spannend, aber nie brutal.',
    gentle: true, voice: 'weiblich, ruhig',
  },
  {
    id: 'gruenderzeit', type: 'podcast', title: 'Gründerzeit', by: 'Jonas Brandt',
    hostIds: ['p-brandt'], year: 2024, duration: 48, episodes: 210,
    rating: 4.5, ratings: 8600, hue: 195, emoji: '🚀',
    genres: ['Wirtschaft'], moods: ['lernen'], situations: ['autofahrt', 'sport'],
    topics: ['Startups', 'Venture Capital', 'Produkt'], platforms: ['spotify', 'apple', 'youtube'],
    desc: 'Jede Woche ein Gründer, eine Idee, eine ehrliche Geschichte. Der Podcast für alle, die selbst bauen wollen.',
  },
  {
    id: 'kosmos', type: 'podcast', title: 'Kosmos Kompakt', by: 'Prof. Anna Lauer',
    hostIds: ['p-lauer'], year: 2022, duration: 35, episodes: 96,
    rating: 4.7, ratings: 11200, hue: 215, emoji: '🪐',
    genres: ['Wissenschaft'], moods: ['lernen'], situations: ['autofahrt', 'haushalt'],
    topics: ['Astrophysik', 'Universum', 'Forschung'], platforms: ['ard', 'spotify', 'apple'],
    desc: 'Schwarze Löcher, Dunkle Materie, Exoplaneten: Prof. Anna Lauer erklärt das Universum in 35 Minuten – verständlich und präzise.',
  },
  {
    id: 'drei-fragezeichen', type: 'hoerspiel', title: 'Die drei ??? – Folge 2: Das Geisterschloss', by: 'Europa',
    speakerIds: [], year: 2024, duration: 72,
    rating: 4.4, ratings: 6800, hue: 205, emoji: '❓',
    genres: ['Krimi', 'Kinder'], moods: ['spannend'], situations: ['autofahrt', 'einschlafen'],
    topics: ['Detektive', 'Rocky Beach'], platforms: ['spotify', 'apple', 'youtube', 'bookbeat'],
    desc: 'Justus, Peter und Bob ermitteln im Geisterschloss – ein Klassiker des dienstältesten Hörspiel-Trios Deutschlands.',
  },
  {
    id: 'sandmann-reisen', type: 'einschlafen', title: 'Sternenreisen – Einschlafgeschichten', by: 'Mara Weidner',
    hostIds: ['p-yogi'], year: 2023, duration: 40,
    rating: 4.6, ratings: 5400, hue: 250, emoji: '🌙',
    genres: ['Achtsamkeit'], moods: ['einschlafen', 'entspannen'], situations: ['einschlafen'],
    topics: ['Schlaf', 'Fantasiereisen'], platforms: ['spotify', 'apple', 'podimo'],
    desc: 'Sanfte Reisen durch nächtliche Landschaften, gesprochen mit der wohl ruhigsten Stimme Deutschlands.',
    voice: 'weiblich, sehr ruhig',
  },
  {
    id: 'atem-meditation', type: 'meditation', title: 'Atempause – 10 Minuten Ruhe', by: 'Mara Weidner',
    hostIds: ['p-yogi'], year: 2024, duration: 10,
    rating: 4.5, ratings: 3200, hue: 95, emoji: '🍃',
    genres: ['Achtsamkeit'], moods: ['entspannen'], situations: ['sport', 'haushalt'],
    topics: ['Atmung', 'Stress'], platforms: ['spotify', 'apple'],
    desc: 'Kurze geführte Meditationen für zwischendurch – ideal nach der Arbeit oder vor wichtigen Terminen.',
    voice: 'weiblich, sehr ruhig',
  },
  {
    id: 'augenzeuge', type: 'hoerbuch', title: 'Der Augensammler', by: 'Sebastian Fitzek',
    authorId: 'p-fitzek', speakerIds: ['p-nachtmann'], year: 2021, duration: 560,
    rating: 4.6, ratings: 14100, hue: 0, emoji: '👁️',
    genres: ['Thriller'], moods: ['spannend'], situations: ['autofahrt'],
    topics: ['Psychothriller', 'Berlin'], platforms: ['audible', 'bookbeat', 'nextory', 'spotify'],
    desc: 'Ein Entführer, der mit der Zeit spielt. Fitzeks Psychothriller als atemlose Lesung – nichts für schwache Nerven.',
    voice: 'weiblich, ruhig',
  },
  {
    id: 'zeitreise', type: 'wissen', title: 'Epochen – Geschichte zum Hören', by: 'ARD',
    year: 2023, duration: 45, episodes: 60,
    rating: 4.5, ratings: 7300, hue: 45, emoji: '🏛️',
    genres: ['Geschichte', 'Wissenschaft'], moods: ['lernen'], situations: ['autofahrt', 'haushalt'],
    topics: ['Rom', 'Mittelalter', 'Moderne'], platforms: ['ard', 'apple'],
    desc: 'Von Caesar bis zur Wiedervereinigung: Historikerinnen erzählen Geschichte so, dass man dranbleibt.',
  },
  {
    id: 'lachlabor', type: 'podcast', title: 'Lachlabor', by: 'Timo & Nele',
    year: 2024, duration: 42, episodes: 88,
    rating: 4.3, ratings: 9900, hue: 55, emoji: '🧪',
    genres: ['Comedy'], moods: ['lustig'], situations: ['haushalt', 'sport', 'autofahrt'],
    topics: ['Alltag', 'Improvisation'], platforms: ['spotify', 'apple', 'youtube', 'podimo'],
    desc: 'Zwei Comedians, ein Mikrofon, null Skript. Der Podcast, bei dem man an der Ampel komisch angeschaut wird.',
  },
  {
    id: 'drachenreiter', type: 'kinder', title: 'Drachenreiter', by: 'Cornelia Funke',
    authorId: 'p-funke', speakerIds: ['p-rufus'], year: 2020, duration: 380,
    rating: 4.7, ratings: 4900, hue: 160, emoji: '🐉',
    genres: ['Fantasy', 'Kinder'], moods: ['spannend', 'lange'], situations: ['einschlafen', 'lange'],
    topics: ['Drachen', 'Abenteuer'], platforms: ['audible', 'spotify', 'bookbeat'],
    desc: 'Der junge Drache Lung sucht den Saum des Himmels – Funkes Abenteuer für die ganze Familie.',
    voice: 'männlich, warm',
  },
  {
    id: 'stimmen-der-nacht', type: 'hoerspiel', title: 'Stimmen der Nacht', by: 'WDR Hörspiel',
    year: 2022, duration: 110,
    rating: 4.4, ratings: 3100, hue: 285, emoji: '🌌',
    genres: ['Thriller', 'Science-Fiction'], moods: ['spannend'], situations: ['einschlafen', 'autofahrt'],
    topics: ['Radio', 'Mystery'], platforms: ['ard', 'spotify'],
    desc: 'Ein nächtlicher Radiomoderator empfängt Anrufe, die es nicht geben dürfte. Preisgekröntes Mystery-Hörspiel.',
  },
  {
    id: 'espanol', type: 'sprachkurs', title: 'Español al Instante', by: 'Lingua Nova',
    year: 2023, duration: 25, episodes: 120,
    rating: 4.2, ratings: 2600, hue: 15, emoji: '🇪🇸',
    genres: ['Wissenschaft'], moods: ['lernen'], situations: ['autofahrt', 'sport'],
    topics: ['Spanisch', 'Sprachen'], platforms: ['spotify', 'apple', 'nextory'],
    desc: 'Spanisch lernen in 25-Minuten-Häppchen – alltagstauglich, mit Muttersprachlern und ohne Grammatik-Overkill.',
  },
  {
    id: 'doku-tiefsee', type: 'doku', title: 'Tiefsee – Der letzte weiße Fleck', by: 'ARD',
    year: 2024, duration: 90,
    rating: 4.6, ratings: 4100, hue: 185, emoji: '🐋',
    genres: ['Wissenschaft', 'Gesellschaft'], moods: ['lernen', 'entspannen'], situations: ['haushalt', 'einschlafen'],
    topics: ['Ozean', 'Forschung', 'Klima'], platforms: ['ard', 'youtube'],
    desc: 'Eine akustische Expedition in die dunkelste Zone des Planeten – mit Originalaufnahmen aus 8.000 Metern Tiefe.',
  },
]

// Echte Cover (iTunes) und Personenfotos (Wikipedia) aus media.json anreichern
curated.forEach((i) => { if (media.covers[i.id]) i.image = media.covers[i.id] })
people.forEach((p) => { if (media.people[p.id]) p.image = media.people[p.id] })

// Echte Top-Podcasts, Hörbuch-Charts, freie Klassiker + kuratierte Titel –
// alles ein einheitliches Datenmodell
export const items = [...realPodcasts, ...realAudiobooks, ...realLibrivox, ...curated]

// Folgen (Beispiel für Objekt-Verknüpfung Folge ↔ Gast)
export const episodes = [
  { id: 'gz-201', parent: 'gruenderzeit', title: 'Folge 201 – Prof. Anna Lauer über Space-Startups', guestIds: ['p-lauer'], duration: 52 },
  { id: 'da-140', parent: 'dunkle-akten', title: 'Folge 140 – Der Fall Elbmarsch', duration: 61 },
]

// ── Community-Listen ────────────────────────────────────────────────────
export const lists = [
  { id: 'l-auto',      title: 'Beste Podcasts für Autofahrten', curator: 'Miriam K.', likes: 1240, itemIds: ['dunkle-akten', 'kosmos', 'gruenderzeit', 'lachlabor', 'zeitreise'] },
  { id: 'l-schlaf',    title: 'Hörbücher zum Einschlafen', curator: 'Nachtmensch', likes: 980, itemIds: ['sandmann-reisen', 'tintenherz', 'drachenreiter', 'doku-tiefsee'] },
  { id: 'l-hoerspiel', title: 'Die spannendsten Hörspiele', curator: 'HörspielHeld', likes: 860, itemIds: ['stimmen-der-nacht', 'drei-fragezeichen'] },
  { id: 'l-gruender',  title: 'Podcasts für Gründer', curator: 'Fabian', likes: 720, itemIds: ['gruenderzeit', 'kosmos'] },
  { id: 'l-unterschaetzt', title: 'Unterschätzte Hörbücher', curator: 'Leiselauscher', likes: 640, itemIds: ['harry-erwachsen', 'augenzeuge', 'dune'] },
]

// ── Aktueller Nutzer ────────────────────────────────────────────────────
export const currentUser = {
  name: 'Fabian',
  handle: '@fabian',
  dna: [
    { trait: 'Story Explorer', value: 92 },
    { trait: 'Fantasy-Fan', value: 88 },
    { trait: 'Night Listener', value: 74 },
    { trait: 'Wissenssammler', value: 61 },
    { trait: 'True-Crime-Liebhaber', value: 55 },
    { trait: 'Sci-Fi-Fan', value: 83 },
  ],
  favorites: ['dune', 'tintenherz', 'kosmos'],
  heard: ['tintenherz', 'dunkle-akten', 'lachlabor'],
  liked: 'tintenherz',
  continue: [
    { itemId: 'dune', progress: 63, last: 'gestern', platform: 'audible' },
    { itemId: 'dunkle-akten', progress: 40, last: 'vor 3 Tagen', platform: 'spotify', episode: 'Folge 140 – Der Fall Elbmarsch' },
    { itemId: 'harry-erwachsen', progress: 12, last: 'vor 1 Woche', platform: 'audible' },
  ],
  activity: [
    { user: 'Miriam K.', action: 'hat „Der Name des Windes“ mit ★★★★★ bewertet', when: 'vor 2 Std.' },
    { user: 'Leiselauscher', action: 'hat die Liste „Unterschätzte Hörbücher“ aktualisiert', when: 'vor 5 Std.' },
    { user: 'Nachtmensch', action: 'folgt jetzt Julia Nachtmann', when: 'gestern' },
  ],
}

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
  if (has('true crime', 'crime')) boost((i) => i.genres.includes('True Crime'), 6, '🔍 True Crime', 'genre')
  if (has('ohne brutal', 'nicht brutal', 'ohne gewalt')) boost((i) => i.gentle, 6, 'ohne brutale Details', 'filter')
  if (has('fantasy')) boost((i) => i.genres.includes('Fantasy'), 6, '🐉 Fantasy', 'genre')
  if (has('sci-fi', 'science')) boost((i) => i.genres.includes('Science-Fiction'), 6, '🪐 Science-Fiction', 'genre')
  if (has('thriller')) boost((i) => i.genres.includes('Thriller'), 6, 'Thriller', 'genre')
  if (has('startup', 'gründ', 'unternehm')) boost((i) => (i.topics || []).some((t) => ['Startups', 'Venture Capital', 'Produkt'].includes(t)), 6, '🚀 Startups', 'thema')
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
  lists.filter((l) => l.itemIds.includes(center.id)).forEach((l) =>
    add({ id: l.id, label: l.title, kind: 'liste', ref: l }, 'Community-Liste'))

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
