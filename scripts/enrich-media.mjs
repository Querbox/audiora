// Reichert kuratierte Titel und Personen mit echten Bildern an – kostenlos, ohne Key.
// Cover: iTunes Search (Hörbücher/Hörspiele) · Fotos: Wikipedia-Thumbnails (frei lizenziert).
// Ausgabe: src/media.json  →  { covers: { itemId: url }, people: { personId: url } }

import { writeFileSync } from 'node:fs'

const COVER_QUERIES = {
  'dune':             { term: 'Dune Der Wüstenplanet Herbert', media: 'audiobook' },
  'herr-der-ringe':   { term: 'Der Herr der Ringe Die Gefährten Tolkien', media: 'audiobook' },
  'tintenherz':       { term: 'Tintenherz Cornelia Funke', media: 'audiobook' },
  'harry-erwachsen':  { term: 'Der Name des Windes Rothfuss', media: 'audiobook' },
  'augenzeuge':       { term: 'Der Augensammler Fitzek', media: 'audiobook' },
  'drachenreiter':    { term: 'Drachenreiter Cornelia Funke', media: 'audiobook' },
  'drei-fragezeichen':{ term: 'Die drei ??? und das Gespensterschloss', media: 'all' },
}

const WIKI_PAGES = {
  'p-rufus':     'Rufus_Beck',
  'p-funke':     'Cornelia_Funke',
  'p-fitzek':    'Sebastian_Fitzek',
  'p-herbert':   'Frank_Herbert',
  'p-tolkien':   'J._R._R._Tolkien',
  'p-nachtmann': 'Julia_Nachtmann',
}

const headers = { 'user-agent': 'Audiora/0.1 (Metadaten-Anreicherung)' }

const covers = {}
for (const [id, q] of Object.entries(COVER_QUERIES)) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q.term)}&media=${q.media}&country=de&limit=1`
    const res = await (await fetch(url, { headers })).json()
    const art = res.results?.[0]?.artworkUrl100
    if (art) {
      covers[id] = art.replace('100x100', '600x600')
      console.log(`✓ Cover ${id}: ${res.results[0].collectionName || res.results[0].trackName}`)
    } else console.warn(`– kein Cover für ${id}`)
  } catch (e) {
    console.warn(`– Cover ${id} fehlgeschlagen: ${e.message}`)
  }
}

const people = {}
for (const [id, page] of Object.entries(WIKI_PAGES)) {
  try {
    const res = await (await fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${page}`, { headers })).json()
    const src = res.thumbnail?.source
    if (src) {
      people[id] = src
      console.log(`✓ Foto ${id}: ${res.title}`)
    } else console.warn(`– kein Foto für ${id}`)
  } catch (e) {
    console.warn(`– Foto ${id} fehlgeschlagen: ${e.message}`)
  }
}

writeFileSync(new URL('../src/media.json', import.meta.url), JSON.stringify({ covers, people }, null, 2))
console.log(`\n${Object.keys(covers).length} Cover, ${Object.keys(people).length} Fotos → src/media.json`)
