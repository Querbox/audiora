import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { buildGraph, items, byId } from '../data.js'

const KIND_COLOR = {
  titel: '#a78bfa',
  person: '#f472b6',
  genre: '#60a5fa',
  thema: '#34d399',
  stimmung: '#fbbf24',
  plattform: '#94a3b8',
  liste: '#fb923c',
}
const KIND_LABEL = {
  titel: 'Titel', person: 'Person', genre: 'Genre', thema: 'Thema',
  stimmung: 'Stimmung', plattform: 'Plattform', liste: 'Liste',
}

// Kleine Force-Simulation (ohne Fremdbibliothek)
function layoutGraph(nodes, links, centerId, W, H) {
  const pos = new Map()
  nodes.forEach((n, i) => {
    if (n.id === centerId) { pos.set(n.id, { x: W / 2, y: H / 2 }); return }
    const angle = (i / nodes.length) * Math.PI * 2
    const r = 180 + (i % 3) * 70
    pos.set(n.id, { x: W / 2 + Math.cos(angle) * r, y: H / 2 + Math.sin(angle) * r })
  })
  // Iterationen: Federkräfte + Abstoßung
  for (let it = 0; it < 260; it++) {
    const force = new Map(nodes.map((n) => [n.id, { x: 0, y: 0 }]))
    // Abstoßung
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const pa = pos.get(nodes[a].id), pb = pos.get(nodes[b].id)
        let dx = pa.x - pb.x, dy = pa.y - pb.y
        let d2 = dx * dx + dy * dy || 1
        const d = Math.sqrt(d2)
        const rep = 9500 / d2
        dx = (dx / d) * rep; dy = (dy / d) * rep
        const fa = force.get(nodes[a].id), fb = force.get(nodes[b].id)
        fa.x += dx * 60; fa.y += dy * 60
        fb.x -= dx * 60; fb.y -= dy * 60
      }
    }
    // Federn
    links.forEach((l) => {
      const pa = pos.get(l.source), pb = pos.get(l.target)
      if (!pa || !pb) return
      const dx = pb.x - pa.x, dy = pb.y - pa.y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const compact = W < 800 ? 0.82 : 1 // schmales Viewport → etwas engere Abstände
      const ideal = (l.source === centerId || l.target === centerId ? 235 : 165) * compact
      const k = 0.02 * (d - ideal)
      const fa = force.get(l.source), fb = force.get(l.target)
      fa.x += (dx / d) * k * 60; fa.y += (dy / d) * k * 60
      fb.x -= (dx / d) * k * 60; fb.y -= (dy / d) * k * 60
    })
    // Zentrum leicht anziehen
    nodes.forEach((n) => {
      const p = pos.get(n.id), f = force.get(n.id)
      f.x += (W / 2 - p.x) * 0.9; f.y += (H / 2 - p.y) * 0.9
      if (n.id === centerId) { p.x = W / 2; p.y = H / 2; return }
      const cool = 0.0022 * (1 - it / 300)
      p.x += Math.max(-6, Math.min(6, f.x * cool))
      p.y += Math.max(-6, Math.min(6, f.y * cool))
    })
  }
  return pos
}

export default function Graph() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const titleId = params.get('titel') || 'dune'
  const center = byId(titleId) || byId('dune')

  // Mobil: Hochformat-Viewport – Knoten wirken größer, Layout nutzt die Höhe
  const isNarrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 780px)').matches
  const W = isNarrow ? 700 : 1200
  const H = isNarrow ? 760 : 640
  const { nodes, links } = useMemo(() => buildGraph(center.id), [center.id])
  const pos = useMemo(() => layoutGraph(nodes, links, center.id, W, H), [nodes, links, center.id, W, H])

  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const drag = useRef(null)
  const touch = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => { setView({ x: 0, y: 0, k: 1 }) }, [center.id])

  const clampK = (k) => Math.max(0.45, Math.min(2.6, k))

  const onWheel = (e) => {
    const k = clampK(view.k * (e.deltaY < 0 ? 1.12 : 0.89))
    setView((v) => ({ ...v, k }))
  }
  const onDown = (e) => { drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y } }
  const onMove = (e) => {
    if (!drag.current) return
    setView((v) => ({ ...v, x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) }))
  }
  const onUp = () => { drag.current = null }

  // Touch: Ein-Finger-Ziehen (Pan), Zwei-Finger-Pinch (Zoom)
  const pinchDist = (ts) => Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY)
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touch.current = { mode: 'pan', sx: e.touches[0].clientX, sy: e.touches[0].clientY, ox: view.x, oy: view.y }
    } else if (e.touches.length === 2) {
      touch.current = { mode: 'pinch', d0: pinchDist(e.touches), k0: view.k }
    }
  }
  const onTouchMove = (e) => {
    const t = touch.current
    if (!t) return
    if (t.mode === 'pan' && e.touches.length === 1) {
      setView((v) => ({ ...v, x: t.ox + (e.touches[0].clientX - t.sx), y: t.oy + (e.touches[0].clientY - t.sy) }))
    } else if (t.mode === 'pinch' && e.touches.length === 2) {
      setView((v) => ({ ...v, k: clampK(t.k0 * (pinchDist(e.touches) / t.d0)) }))
    }
  }
  const onTouchEnd = () => { touch.current = null }

  const clickNode = (n) => {
    if (n.kind === 'titel' && n.id !== center.id) setParams({ titel: n.id })
    else if (n.kind === 'person' && n.ref) nav(`/person/${n.id}`)
    else if (n.kind === 'person' && n.search) nav(`/suche?q=${encodeURIComponent(n.search)}`)
    else if (n.kind === 'liste') nav(`/listen/${n.id}`)
    else if (n.kind === 'genre') nav(`/suche?q=${encodeURIComponent(n.label)}`)
    else if (n.kind === 'thema') nav(`/suche?q=${encodeURIComponent(n.label.replace(/^# /, ''))}`)
    else if (n.kind === 'stimmung') nav(`/suche?q=${encodeURIComponent(n.label)}`)
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="kicker">Audio Graph</div>
        <h1>Alles ist verbunden.</h1>
        <p>
          Im Mittelpunkt: <b style={{ color: 'var(--text)' }}>{center.title}</b>.
          Drumherum alle Verbindungen – Sprecher, Autoren, Themen, Stimmungen, Plattformen und ähnliche Inhalte.
          Jeder Klick eröffnet neue Welten.
        </p>
      </div>

      <div
        className="graph-wrap"
        onWheel={onWheel}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transformOrigin: `${W / 2}px ${H / 2}px` }}>
            {links.map((l, i) => {
              const a = pos.get(l.source), b = pos.get(l.target)
              if (!a || !b) return null
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(167,139,250,0.18)" strokeWidth="1.4" />
                  <text x={mx} y={my - 4} textAnchor="middle" fontSize="9.5" fill="rgba(164,159,181,0.55)" fontFamily="Instrument Sans">
                    {l.relation}
                  </text>
                </g>
              )
            })}
            {nodes.map((n) => {
              const p = pos.get(n.id)
              if (!p) return null
              const isCenter = n.id === center.id
              const r = isCenter ? 44 : n.kind === 'titel' ? 26 : 20
              const color = KIND_COLOR[n.kind]
              const label = n.label.length > 26 ? n.label.slice(0, 25) + '…' : n.label
              return (
                <g key={n.id} className="graph-node" onClick={() => clickNode(n)} transform={`translate(${p.x} ${p.y})`}>
                  {isCenter && <circle r={r + 14} fill="none" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" strokeDasharray="3 5" />}
                  <circle r={r} fill={isCenter ? 'url(#centerGrad)' : 'rgba(20,18,28,0.95)'} stroke={color} strokeWidth={isCenter ? 2.5 : 1.6} />
                  {n.ref?.emoji && <text textAnchor="middle" dy={isCenter ? 8 : 6} fontSize={isCenter ? 26 : 16}>{n.ref.emoji}</text>}
                  {!n.ref?.emoji && <circle r={4} fill={color} />}
                  <text textAnchor="middle" dy={r + 16} fontSize={isCenter ? 13 : 11} fontWeight={isCenter ? 700 : 500}
                    fill={isCenter ? '#f2f0f7' : '#a49fb5'} fontFamily="Instrument Sans">
                    {label}
                  </text>
                  {n.sub && (
                    <text textAnchor="middle" dy={r + 29} fontSize="9.5" fill="#6f6a80" fontFamily="Instrument Sans">{n.sub}</text>
                  )}
                </g>
              )
            })}
          </g>
          <defs>
            <radialGradient id="centerGrad">
              <stop offset="0%" stopColor="#3b2a75" />
              <stop offset="100%" stopColor="#171226" />
            </radialGradient>
          </defs>
        </svg>

        <div className="graph-hint">
          {isNarrow
            ? 'Ziehen · Pinch-Zoom · Tippen zum Erkunden'
            : 'Scrollen zum Zoomen · Ziehen zum Verschieben · Klicken zum Erkunden'}
        </div>
        <div className="graph-legend">
          {Object.entries(KIND_LABEL).map(([k, label]) => (
            <span key={k}><span className="legend-dot" style={{ background: KIND_COLOR[k] }} />{label}</span>
          ))}
        </div>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-head"><h2>Anderen Titel in den Mittelpunkt stellen</h2></div>
        <div className="graph-picker">
          {items.filter((i) => !i.real || i.chartRank <= 10).map((i) => (
            <button
              key={i.id}
              className={`chip ${i.id === center.id ? 'accent' : ''}`}
              onClick={() => setParams({ titel: i.id })}
            >
              {i.emoji} {i.title}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: 13.5, margin: '18px 0 40px' }}>
          Zum Titel: <Link to={`/titel/${center.id}`} style={{ color: 'var(--accent)' }}>{center.title} →</Link>
        </p>
      </div>
    </div>
  )
}
