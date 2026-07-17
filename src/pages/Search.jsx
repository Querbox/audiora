import { useSearchParams, Link } from 'react-router-dom'
import { smartSearch, MOODS, items } from '../data.js'
import { SearchBar, TitleCard } from '../components/shared.jsx'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const mood = params.get('mood') || ''

  let results, signals = [], persons = []
  if (mood) {
    const m = MOODS.find((x) => x.id === mood)
    results = items.filter((i) => i.moods.includes(mood) || i.situations.includes(mood))
    signals = m ? [{ label: `${m.emoji} ${m.label}`, type: 'stimmung' }] : []
  } else if (q) {
    const r = smartSearch(q)
    results = r.results
    signals = r.signals
    persons = r.persons
  } else {
    results = [...items].sort((a, b) => b.rating - a.rating)
  }

  return (
    <div className="shell">
      <div className="page-head">
        <h1>Suche</h1>
        <p>Sag einfach, wonach dir ist – Audiora versteht natürliche Sprache.</p>
      </div>
      <SearchBar initial={q} />

      {signals.length > 0 && (
        <div className="signal-row">
          <span style={{ fontSize: 13, color: 'var(--text-faint)', alignSelf: 'center' }}>✨ Verstanden:</span>
          {signals.map((s, i) => <span key={i} className="chip accent">{s.label}</span>)}
        </div>
      )}

      {persons.length > 0 && (
        <div className="person-row">
          {persons.map((p) => (
            <Link key={p.id} to={`/person/${p.id}`} className="person-card">
              <span className="person-ava" style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 70%), hsl(${p.hue + 40} 60% 55%))` }}>
                {p.name[0]}
              </span>
              <span>
                <div className="pn">{p.name}</div>
                <div className="pr">{p.role}</div>
              </span>
            </Link>
          ))}
        </div>
      )}

      {results.length ? (
        <div className="results-grid">
          {results.map((i) => <TitleCard key={i.id} item={i} />)}
        </div>
      ) : (
        <div className="empty">Nichts gefunden – probiere es mit anderen Worten, Audiora versteht ganze Sätze.</div>
      )}
    </div>
  )
}
