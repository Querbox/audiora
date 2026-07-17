import { Link } from 'react-router-dom'
import { MOODS, GENRES, items, lists, currentUser, byId, fmtDuration, PLATFORMS } from '../data.js'
import { SearchBar, Section, Rail, Cover } from '../components/shared.jsx'

const HINTS = [
  'Ich suche etwas Spannendes für eine Stunde Autofahrt.',
  'Etwas wie Harry Potter, aber für Erwachsene.',
  'True Crime ohne brutale Details.',
  'Hörbücher mit ruhiger männlicher Stimme.',
  'Podcasts über Startups.',
]

function ContinueRow() {
  return (
    <div className="continue-row">
      {currentUser.continue.map((c) => {
        const item = byId(c.itemId)
        return (
          <div className="continue-card" key={c.itemId}>
            <Link to={`/titel/${item.id}`}><Cover item={item} className="sm" showType={false} /></Link>
            <div className="continue-info">
              <Link to={`/titel/${item.id}`} className="t" style={{ display: 'block' }}>{item.title}</Link>
              <div className="m">{c.progress} % gehört · Zuletzt {c.last} gehört{c.episode ? ` · ${c.episode}` : ''}</div>
              <div className="progress"><i style={{ width: `${c.progress}%` }} /></div>
              <a className="continue-cta" href="#" onClick={(e) => e.preventDefault()}>
                Bei {PLATFORMS[c.platform].name} fortsetzen →
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const charts = items.filter((i) => i.chartRank).sort((a, b) => a.chartRank - b.chartRank)
  const popular = charts.length ? charts.slice(0, 12) : [...items].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)).slice(0, 8)
  const recommended = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8)
  const becauseOf = items.filter((i) => i.genres.includes('Fantasy') && i.id !== 'tintenherz')

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

      <Section title="Weiterhören" sub="Nahtlos da weitermachen, wo du aufgehört hast – beim Anbieter deiner Wahl.">
        <ContinueRow />
      </Section>

      <Section title="Persönliche Empfehlungen" sub={`Basierend auf deiner Audio-DNA, ${currentUser.name}`} moreTo="/dna">
        <Rail items={recommended} />
      </Section>

      <Section title="Beliebt in Deutschland" sub="Die echten deutschen Podcast-Charts – automatisch importiert und täglich aktualisiert." moreTo="/suche?q=podcast">
        <Rail items={popular} />
      </Section>

      <Section title="Weil dir „Tintenherz“ gefallen hat" moreTo="/titel/tintenherz">
        <Rail items={becauseOf} />
      </Section>

      <Section title="Nach Genre entdecken">
        <div className="platforms">
          {GENRES.map((g) => (
            <Link key={g} to={`/suche?q=${encodeURIComponent(g)}`} className="chip">{g}</Link>
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

      <Section title="Community-Listen" sub="Kuratiert von Menschen, nicht von Algorithmen." moreTo="/listen">
        <div className="list-grid">
          {lists.slice(0, 3).map((l) => (
            <Link key={l.id} to={`/listen/${l.id}`} className="list-card">
              <div className="list-covers">
                {l.itemIds.slice(0, 4).map((id) => <Cover key={id} item={byId(id)} showType={false} />)}
              </div>
              <h3>{l.title}</h3>
              <div className="lc-meta">
                <span>von {l.curator}</span>
                <span>♥ {l.likes.toLocaleString('de-DE')}</span>
                <span>{l.itemIds.length} Titel</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
