import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { smartSearch, MOODS, TYPE_LABEL, items } from '../data.js'
import { SearchBar, TitleCard } from '../components/shared.jsx'

// Bevorzugte Reihenfolge der Formate
const TYPE_ORDER = ['podcast', 'hoerbuch', 'hoerspiel', 'meditation', 'einschlafen', 'kinder', 'wissen', 'doku', 'sprachkurs', 'folge']

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''

  // Verfügbare Filteroptionen aus den echten Daten ableiten
  const { typeOptions, genreOptions } = useMemo(() => {
    const typeSet = new Set(items.map((i) => i.type))
    const genreCount = {}
    items.forEach((i) => (i.genres || []).forEach((g) => { genreCount[g] = (genreCount[g] || 0) + 1 }))
    return {
      typeOptions: TYPE_ORDER.filter((t) => typeSet.has(t)),
      genreOptions: Object.entries(genreCount).sort((a, b) => b[1] - a[1]).map(([g]) => g).slice(0, 14),
    }
  }, [])

  const list = (key) => (params.get(key) || '').split(',').filter(Boolean)
  const typeF = list('type'), moodF = list('mood'), genreF = list('genre')
  const anyFilter = typeF.length || moodF.length || genreF.length

  const toggle = (key, val) => {
    const cur = new Set(list(key))
    cur.has(val) ? cur.delete(val) : cur.add(val)
    const next = new URLSearchParams(params)
    cur.size ? next.set(key, [...cur].join(',')) : next.delete(key)
    setParams(next)
  }

  const resetFilters = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    setParams(next)
  }

  // Basismenge: Freitextergebnis oder alle Titel
  let signals = [], persons = []
  let base
  if (q) {
    const r = smartSearch(q)
    base = r.results
    signals = r.signals
    persons = r.persons
  } else {
    base = [...items].sort((a, b) => {
      const score = (x) => x.rating != null ? x.rating : x.chartRank != null ? 5 - Math.min(x.chartRank, 50) / 50 : 3
      return score(b) - score(a)
    })
  }

  // Filter anwenden (innerhalb einer Gruppe ODER, zwischen Gruppen UND)
  const results = base.filter((i) => {
    if (typeF.length && !typeF.includes(i.type)) return false
    if (moodF.length && !moodF.some((m) => (i.moods || []).includes(m) || (i.situations || []).includes(m))) return false
    if (genreF.length && !genreF.some((g) => (i.genres || []).includes(g))) return false
    return true
  })

  const FilterChip = ({ active, onClick, children }) => (
    <button className={`chip ${active ? 'accent' : ''}`} onClick={onClick}>{children}</button>
  )

  return (
    <div className="shell">
      <div className="page-head">
        <h1>Suche</h1>
        <p>Sag einfach, wonach dir ist – oder filtere mit einem Klick.</p>
      </div>
      <SearchBar initial={q} />

      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">Format</span>
          {typeOptions.map((t) => (
            <FilterChip key={t} active={typeF.includes(t)} onClick={() => toggle('type', t)}>
              {TYPE_LABEL[t] || t}
            </FilterChip>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">Stimmung & Situation</span>
          {MOODS.map((m) => (
            <FilterChip key={m.id} active={moodF.includes(m.id)} onClick={() => toggle('mood', m.id)}>
              {m.emoji} {m.label}
            </FilterChip>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">Genre</span>
          {genreOptions.map((g) => (
            <FilterChip key={g} active={genreF.includes(g)} onClick={() => toggle('genre', g)}>
              {g}
            </FilterChip>
          ))}
        </div>
      </div>

      {signals.length > 0 && (
        <div className="signal-row">
          <span style={{ fontSize: 13, color: 'var(--text-faint)', alignSelf: 'center' }}>✨ Verstanden:</span>
          {signals.map((s, i) => <span key={i} className="chip accent">{s.label}</span>)}
        </div>
      )}

      <div className="results-head">
        <span>{results.length} {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'}</span>
        {anyFilter ? <button className="reset-link" onClick={resetFilters}>Filter zurücksetzen ✕</button> : null}
      </div>

      {persons.length > 0 && (
        <div className="person-row">
          {persons.map((p) => (
            <Link key={p.id} to={`/person/${p.id}`} className="person-card">
              <span className="person-ava" style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 70%), hsl(${p.hue + 40} 60% 55%))` }}>
                {p.image ? <img src={p.image} alt={p.name} /> : p.name[0]}
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
        <div className="empty">
          Nichts gefunden.{' '}
          {anyFilter
            ? <button className="reset-link" onClick={resetFilters}>Filter zurücksetzen</button>
            : 'Probiere es mit anderen Worten – Audiora versteht ganze Sätze.'}
        </div>
      )}
    </div>
  )
}
