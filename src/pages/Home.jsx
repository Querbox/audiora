import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MOODS, GENRES, items, byId, similarTo } from '../data.js'
import { SearchBar, Section, Rail, Cover } from '../components/shared.jsx'
import { useAuth, useUserLibrary } from '../auth.jsx'
import { getRecent } from '../lib/recent.js'
import { fetchCommunityLists } from '../lib/community.js'

const HINTS = [
  'Ich suche etwas Spannendes für eine Stunde Autofahrt.',
  'Etwas wie Harry Potter, aber für Erwachsene.',
  'True Crime ohne brutale Details.',
  'Hörbücher mit ruhiger männlicher Stimme.',
  'Podcasts über Startups.',
]

// Empfehlungen aus den echten Markierungen des Nutzers ableiten
function personalRecs(rows) {
  const marked = rows.map((r) => byId(r.item_id)).filter(Boolean)
  if (!marked.length) return []
  const gCount = {}, mCount = {}
  marked.forEach((i) => {
    ;(i.genres || []).forEach((g) => { gCount[g] = (gCount[g] || 0) + 1 })
    ;(i.moods || []).forEach((m) => { mCount[m] = (mCount[m] || 0) + 1 })
  })
  const markedIds = new Set(rows.map((r) => r.item_id))
  return items
    .filter((i) => !markedIds.has(i.id))
    .map((i) => [
      i,
      (i.genres || []).reduce((s, g) => s + (gCount[g] || 0), 0) * 2 +
      (i.moods || []).reduce((s, m) => s + (mCount[m] || 0), 0),
    ])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([i]) => i)
}

function LandingCta() {
  return (
    <section className="section shell">
      <div className="landing-cta">
        <div className="lc-head">
          <h2>Deine persönliche Audio-Welt</h2>
        <p>Kostenlos registrieren und aus Audiora deine Zentrale für alles Hörbare machen.</p>
        </div>
        <div className="lc-features">
          <div className="lc-feature">
            <span className="lf-icon">🧬</span>
            <b>Audio-DNA</b>
            <span>Dein Geschmack, automatisch analysiert und sichtbar gemacht.</span>
          </div>
          <div className="lc-feature">
            <span className="lf-icon">📚</span>
            <b>Listen & Community</b>
            <span>Sammle Favoriten, erstelle Listen und folge anderen Hörern.</span>
          </div>
          <div className="lc-feature">
            <span className="lf-icon">✦</span>
            <b>Empfehlungen</b>
            <span>Vorschläge, die zu dir passen – erklärbar statt Blackbox.</span>
          </div>
        </div>
        <div className="lc-actions">
          <Link to="/anmelden" className="btn cta">Kostenlos registrieren</Link>
          <Link to="/anmelden" className="btn">Schon dabei? Anmelden</Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { user } = useAuth()
  const library = useUserLibrary()
  const [communityLists, setCommunityLists] = useState([])

  useEffect(() => {
    fetchCommunityLists()
      .then((ls) => setCommunityLists(ls.sort((a, b) => b.likes - a.likes).slice(0, 3)))
      .catch(() => {})
  }, [])

  const podcastCharts = items.filter((i) => i.chartRank && i.type === 'podcast').sort((a, b) => a.chartRank - b.chartRank)
  const audiobookCharts = items.filter((i) => i.chartRank && i.type === 'hoerbuch').sort((a, b) => a.chartRank - b.chartRank)
  const classics = items.filter((i) => i.free)

  // Echte persönliche Daten (nur eingeloggt)
  const recent = useMemo(() => (user ? getRecent().map(byId).filter(Boolean) : []), [user])
  const recs = useMemo(() => (user && library ? personalRecs(library) : []), [user, library])
  const lastFav = useMemo(() => {
    if (!user || !library) return null
    const fav = library
      .filter((r) => r.fav)
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0]
    return fav ? byId(fav.item_id) : null
  }, [user, library])
  const becauseOf = lastFav ? similarTo(lastFav, 8) : []

  return (
    <>
      <header className="hero shell">
        <h1>Die Heimat für alles,<br />was <em>hörbar</em> ist.</h1>
        <p className="sub">
          Entdecke, organisiere und bewerte Podcasts, Hörbücher und Hörspiele –
          plattformübergreifend, intelligent vernetzt.
        </p>
        <SearchBar big />
        <div className="search-hints">
          {HINTS.map((h) => (
            <Link key={h} to={`/suche?q=${encodeURIComponent(h)}`} className="hint-chip">„{h}“</Link>
          ))}
        </div>
      </header>

      <Section title="Worauf hast du heute Lust?">
        <div className="moods">
          {MOODS.map((m) => (
            <Link key={m.id} to={`/suche?mood=${m.id}`} className="mood-card">
              <span className="emoji">{m.emoji}</span>
              <span className="label">{m.label}</span>
            </Link>
          ))}
        </div>
      </Section>

      {!user && <LandingCta />}

      {user && recent.length > 0 && (
        <Section title="Zuletzt angesehen" sub="Da weitermachen, wo du zuletzt gestöbert hast.">
          <Rail items={recent.slice(0, 8)} />
        </Section>
      )}

      {user && recs.length > 0 && (
        <Section title="Persönliche Empfehlungen" sub="Basierend auf deinen Favoriten und Markierungen." moreTo="/dna">
          <Rail items={recs} />
        </Section>
      )}
      {user && library && library.length === 0 && (
        <Section title="Persönliche Empfehlungen">
          <div className="claim-banner" style={{ margin: 0 }}>
            <span>Markiere Titel als <b>♥ Favorit</b> oder <b>✓ Gehört</b> – dann entstehen hier deine persönlichen Empfehlungen.</span>
          </div>
        </Section>
      )}

      {lastFav && becauseOf.length > 0 && (
        <Section title={`Weil dir „${lastFav.title}“ gefallen hat`} moreTo={`/titel/${lastFav.id}`}>
          <Rail items={becauseOf} />
        </Section>
      )}

      <Section title="Beliebt in Deutschland" sub="Die echten deutschen Podcast-Charts – automatisch importiert und täglich aktualisiert." moreTo="/suche?type=podcast">
        <Rail items={podcastCharts.slice(0, 12)} />
      </Section>

      {audiobookCharts.length > 0 && (
        <Section title="Hörbuch-Charts Deutschland" sub="Die meistgekauften Hörbücher – live aus den Apple-Charts." moreTo="/suche?type=hoerbuch">
          <Rail items={audiobookCharts.slice(0, 12)} />
        </Section>
      )}

      {classics.length > 0 && (
        <Section title="Klassiker kostenlos hören" sub="Gemeinfreie Hörbücher von LibriVox – vollständig, legal und für immer kostenlos.">
          <Rail items={classics} />
        </Section>
      )}

      <Section title="Nach Genre entdecken">
        <div className="platforms">
          {GENRES.map((g) => (
            <Link key={g} to={`/suche?genre=${encodeURIComponent(g)}`} className="chip">{g}</Link>
          ))}
        </div>
      </Section>

      <Section title="Nach Stimmung & Situation entdecken">
        <div className="platforms">
          {MOODS.map((m) => (
            <Link key={m.id} to={`/suche?mood=${m.id}`} className="chip">{m.emoji} {m.label}</Link>
          ))}
        </div>
      </Section>

      {communityLists.length > 0 && (
        <Section title="Community-Listen" sub="Kuratiert von echten Hörerinnen und Hörern." moreTo="/listen">
          <div className="list-grid">
            {communityLists.map((l) => {
              const covers = l.itemIds.slice(0, 4).map(byId).filter(Boolean)
              return (
                <Link key={l.id} to={`/listen/${l.id}`} className="list-card">
                  <div className="list-covers">
                    {covers.length
                      ? covers.map((i) => <Cover key={i.id} item={i} showType={false} />)
                      : <div className="list-covers-empty">Noch keine Titel</div>}
                  </div>
                  <h3>{l.title}</h3>
                  <div className="lc-meta">
                    <span>von {l.curator}</span>
                    <span>♥ {l.likes.toLocaleString('de-DE')}</span>
                    <span>{l.itemIds.length} Titel</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </Section>
      )}
    </>
  )
}
