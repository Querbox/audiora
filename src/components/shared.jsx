import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { PLATFORMS, TYPE_LABEL, fmtDuration, currentUser } from '../data.js'

// Cover: echtes Artwork (importierte Podcasts) oder Gradient + Emoji (kuratiert)
export function Cover({ item, className = '', showType = true }) {
  const h = item.hue ?? 260
  return (
    <div
      className={`cover ${className}`}
      style={{
        background: `linear-gradient(140deg, hsl(${h} 60% 26%), hsl(${(h + 40) % 360} 70% 14%))`,
      }}
    >
      {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
      {showType && <span className="cover-type">{TYPE_LABEL[item.type] || 'Audio'}</span>}
      {!item.image && <span>{item.emoji}</span>}
    </div>
  )
}

export function TitleCard({ item }) {
  return (
    <Link to={`/titel/${item.id}`} className="tcard">
      <Cover item={item} />
      <div>
        <div className="tt">{item.title}</div>
        <div className="tb">{item.by}</div>
        <div className="tr">
          {item.rating != null
            ? <><span className="star">★</span> {item.rating.toFixed(1)}</>
            : item.chartRank != null && <span className="star">Platz {item.chartRank}</span>}
          <span style={{ color: 'var(--text-faint)' }}>
            {item.duration != null ? `· ${fmtDuration(item.duration)}` : item.episodes != null ? `· ${item.episodes} Folgen` : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function Section({ title, sub, moreTo, children }) {
  return (
    <section className="section shell">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {sub && <div className="section-sub">{sub}</div>}
        </div>
        {moreTo && <Link className="more" to={moreTo}>Alle anzeigen →</Link>}
      </div>
      {children}
    </section>
  )
}

export function Rail({ items }) {
  return (
    <div className="rail">
      {items.map((i) => <TitleCard key={i.id} item={i} />)}
    </div>
  )
}

export function PlatformButtons({ ids, links }) {
  return (
    <div className="platforms">
      {ids.map((p) => {
        const href = links?.[p]
        return (
          <a
            key={p}
            className="platform-btn"
            href={href || '#'}
            target={href ? '_blank' : undefined}
            rel={href ? 'noreferrer' : undefined}
            onClick={href ? undefined : (e) => e.preventDefault()}
            title={`Bei ${PLATFORMS[p].name} öffnen`}
          >
            {PLATFORMS[p].logo
              ? <img className="pf-logo" src={PLATFORMS[p].logo} alt="" />
              : <span className="pf-mark" style={{ background: PLATFORMS[p].color }}>{PLATFORMS[p].name[0]}</span>}
            {PLATFORMS[p].name}
            <span className="open">↗</span>
          </a>
        )
      })}
    </div>
  )
}

export function SearchBar({ big = false, initial = '' }) {
  const [q, setQ] = useState(initial)
  const nav = useNavigate()
  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) nav(`/suche?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <span style={{ opacity: 0.5 }}>🔍</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Suche nach Podcasts, Hörbüchern, Hörspielen, Autoren, Sprechern oder Themen..."
        aria-label="Suche"
      />
      <button className="go" type="submit">Suchen</button>
    </form>
  )
}

export function Navbar() {
  return (
    <nav className="nav">
      <div className="shell nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">🎧</span> Audiora
        </Link>
        <div className="nav-links">
          <NavLink to="/" end>Entdecken</NavLink>
          <NavLink to="/graph">Audio Graph</NavLink>
          <NavLink to="/listen">Listen</NavLink>
          <NavLink to="/dna">Meine Audio-DNA</NavLink>
        </div>
        <div className="nav-spacer" />
        <Link to="/dna" className="nav-user">
          <span>{currentUser.handle}</span>
          <span className="avatar">{currentUser.name[0]}</span>
        </Link>
      </div>
    </nav>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="shell foot-inner">
        <div>
          <b style={{ color: 'var(--text-dim)' }}>Audiora</b> — Die Heimat für alles, was hörbar ist.
          <br />Nicht der Ort, an dem Audio abgespielt wird. Sondern der Ort, an dem du entscheidest, was du als Nächstes hörst.
        </div>
        <div style={{ textAlign: 'right' }}>
          Datenquellen: Spotify · Podcast Index · Open Library
          <br />Ergänzt durch KI & Community · Made in Germany 🇩🇪
        </div>
      </div>
    </footer>
  )
}
