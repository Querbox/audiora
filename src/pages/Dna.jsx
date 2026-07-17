import { Link } from 'react-router-dom'
import { byId } from '../data.js'
import { Section, Rail } from '../components/shared.jsx'
import { useAuth, useUserLibrary } from '../auth.jsx'

// Radar-Diagramm als reines SVG
function DnaRadar({ dna }) {
  const cx = 190, cy = 180, R = 130
  const n = dna.length
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }
  const poly = dna.map((d, i) => pt(i, (d.value / 100) * R).join(',')).join(' ')
  return (
    <svg viewBox="-55 -5 490 380" width="100%">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={dna.map((_, i) => pt(i, R * f).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.07)"
        />
      ))}
      {dna.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" />
      })}
      <polygon points={poly} fill="rgba(124,92,255,0.28)" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
      {dna.map((d, i) => {
        const [x, y] = pt(i, (d.value / 100) * R)
        return <circle key={i} cx={x} cy={y} r="4" fill="#c4b5fd" />
      })}
      {dna.map((d, i) => {
        const [x, y] = pt(i, R + 26)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontSize="11.5" fill="#a49fb5" fontFamily="Instrument Sans" fontWeight="600">
            {d.trait}
          </text>
        )
      })}
    </svg>
  )
}

// DNA aus echten Markierungen berechnen
function computeDna(items) {
  const has = (fn) => items.filter(fn).length
  const total = Math.max(items.length, 1)
  const pct = (n, boost = 0) => Math.min(98, Math.round((n / total) * 100 * 0.9 + boost))
  const traits = [
    { trait: 'Story Explorer', value: pct(has((i) => i.moods?.includes('lange')), 8) },
    { trait: 'Fantasy-Fan', value: pct(has((i) => i.genres?.includes('Fantasy'))) },
    { trait: 'Sci-Fi-Fan', value: pct(has((i) => i.genres?.includes('Science-Fiction'))) },
    { trait: 'True-Crime-Fan', value: pct(has((i) => i.genres?.includes('True Crime') || i.genres?.includes('Thriller'))) },
    { trait: 'Wissenssammler', value: pct(has((i) => i.moods?.includes('lernen'))) },
    { trait: 'Night Listener', value: pct(has((i) => i.situations?.includes('einschlafen')), 4) },
  ]
  return traits
}

export default function Dna() {
  const { user, profile, loading } = useAuth()
  const library = useUserLibrary()

  // Ohne Login: vollwertige, klar gekennzeichnete Vorschau des Features
  if (!user) {
    if (loading) return <div className="shell empty">Lädt…</div>
    const previewDna = [
      { trait: 'Story Explorer', value: 92 },
      { trait: 'Fantasy-Fan', value: 88 },
      { trait: 'Sci-Fi-Fan', value: 83 },
      { trait: 'Night Listener', value: 74 },
      { trait: 'Wissenssammler', value: 61 },
      { trait: 'True-Crime-Fan', value: 55 },
    ]
    return (
      <div className="shell">
        <div className="profile-head">
          <div className="profile-ava" style={{ background: 'linear-gradient(135deg, #7c5cff, #c4b5fd)' }}>🧬</div>
          <div>
            <div className="kicker">Feature-Vorschau</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700 }}>Deine Audio-DNA</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 8, maxWidth: 600 }}>
              Audiora analysiert automatisch, was du hörst, markierst und sammelst – und macht
              deinen Geschmack sichtbar. <b style={{ color: 'var(--text)' }}>So könnte deine DNA aussehen:</b>
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {previewDna.slice(0, 3).map((d) => (
                <span key={d.trait} className="chip accent">✦ {d.trait}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="dna-grid preview-blur">
          <DnaRadar dna={previewDna} />
          <div className="dna-bars">
            {previewDna.map((d, i) => (
              <div className="dna-bar" key={d.trait}>
                <div className="lbl"><b>{d.trait}</b><span>{d.value} %</span></div>
                <div className="dna-track"><i style={{ width: `${d.value}%`, animationDelay: `${i * 0.08}s` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="claim-banner" style={{ marginTop: 10 }}>
          <span>
            Das ist ein <b>Beispiel</b>. Deine echte Audio-DNA entsteht aus deinen eigenen
            Favoriten, Markierungen und Listen – kostenlos und automatisch.
          </span>
          <Link to="/anmelden" className="btn primary">Kostenlos registrieren</Link>
        </div>

        <div className="actions" style={{ marginTop: 26, marginBottom: 50 }}>
          <Link to="/graph" className="btn">✦ Auch cool: der Audio Graph</Link>
          <Link to="/listen" className="btn">📚 Community-Listen ansehen</Link>
        </div>
      </div>
    )
  }

  const libItems = (library || []).map((r) => ({ ...r, item: byId(r.item_id) })).filter((r) => r.item)
  const favs = libItems.filter((r) => r.fav).map((r) => r.item)
  const heard = libItems.filter((r) => r.heard).map((r) => r.item)
  const marked = libItems.map((r) => r.item)

  const name = profile?.username || 'du'
  const dna = marked.length > 0 ? computeDna(marked) : []
  const top = [...dna].sort((a, b) => b.value - a.value)
  const empty = marked.length === 0

  return (
    <>
      <div className="shell">
        <div className="profile-head">
          <div className="profile-ava" style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)' }}>
            {name[0].toUpperCase()}
          </div>
          <div>
            <div className="kicker">Hörer-Profil · Live</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700 }}>{name[0].toUpperCase() + name.slice(1)}s Audio-DNA</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 8, maxWidth: 600 }}>
              Deine Audio-DNA entsteht automatisch aus dem, was du hörst, bewertest und speicherst.
              Sie macht deine Empfehlungen erklärbar – und dich für andere entdeckbar.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {!empty && top.slice(0, 3).map((d) => (
                <span key={d.trait} className="chip accent">✦ {d.trait}</span>
              ))}
            </div>
            <div className="actions" style={{ marginTop: 18 }}>
              {profile?.username && <Link to={`/hoerer/${profile.username}`} className="btn">👤 Mein öffentliches Profil</Link>}
              <Link to="/listen" className="btn">📚 Listen & Community</Link>
            </div>
          </div>
        </div>

        {empty ? (
          <div className="claim-banner">
            <span>
              Noch keine Daten: Markiere Titel als <b>♥ Favorit</b> oder <b>✓ Gehört</b>,
              dann entsteht hier deine persönliche Audio-DNA.
            </span>
            <Link to="/" className="btn primary">Jetzt entdecken</Link>
          </div>
        ) : (
          <div className="dna-grid">
            <DnaRadar dna={dna} />
            <div className="dna-bars">
              {top.map((d, i) => (
                <div className="dna-bar" key={d.trait}>
                  <div className="lbl"><b>{d.trait}</b><span>{d.value} %</span></div>
                  <div className="dna-track"><i style={{ width: `${d.value}%`, animationDelay: `${i * 0.08}s` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!empty && (
          <div className="ki-note" style={{ maxWidth: 'none' }}>
            <span className="spark">✦</span>
            <span>
              <b>Deine KI-Analyse:</b>{' '}
              {`Deine DNA basiert auf ${marked.length} markierten Titeln. ${top[0].value > 50 ? `Am stärksten ausgeprägt: ${top[0].trait}.` : 'Markiere mehr Titel, um dein Profil zu schärfen.'}`}
            </span>
          </div>
        )}
      </div>

      {favs.length > 0 && (
        <Section title="Deine Favoriten">
          <Rail items={favs} />
        </Section>
      )}
      {heard.length > 0 && (
        <Section title="Als „Gehört“ markiert">
          <Rail items={heard} />
        </Section>
      )}
    </>
  )
}
