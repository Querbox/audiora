import { currentUser, byId } from '../data.js'
import { Section, Rail } from '../components/shared.jsx'

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

export default function Dna() {
  const favs = currentUser.favorites.map(byId)
  const heard = currentUser.heard.map(byId)
  const top = [...currentUser.dna].sort((a, b) => b.value - a.value)

  return (
    <>
      <div className="shell">
        <div className="profile-head">
          <div className="profile-ava" style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)' }}>
            {currentUser.name[0]}
          </div>
          <div>
            <div className="kicker">Hörer-Profil</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700 }}>{currentUser.name}s Audio-DNA</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 8, maxWidth: 600 }}>
              Deine Audio-DNA entsteht automatisch aus dem, was du hörst, bewertest und speicherst.
              Sie macht deine Empfehlungen erklärbar – und dich für andere entdeckbar.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {top.slice(0, 3).map((d) => (
                <span key={d.trait} className="chip accent">✦ {d.trait}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="dna-grid">
          <DnaRadar dna={currentUser.dna} />
          <div className="dna-bars">
            {top.map((d, i) => (
              <div className="dna-bar" key={d.trait}>
                <div className="lbl"><b>{d.trait}</b><span>{d.value} %</span></div>
                <div className="dna-track"><i style={{ width: `${d.value}%`, animationDelay: `${i * 0.08}s` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="ki-note" style={{ maxWidth: 'none' }}>
          <span className="spark">✦</span>
          <span>
            <b>Deine KI-Analyse:</b> Du liebst lange, erzählerische Welten – vor allem Fantasy und Science-Fiction –
            und hörst am liebsten abends. Ruhige Stimmen halten dich bei der Stange, True Crime darf es sein,
            solange es unaufgeregt bleibt. Deshalb siehst du mehr epische Lesungen und weniger kurze Laber-Formate.
          </span>
        </div>
      </div>

      <Section title="Deine Favoriten">
        <Rail items={favs} />
      </Section>
      <Section title="Als „Gehört“ markiert">
        <Rail items={heard} />
      </Section>
    </>
  )
}
