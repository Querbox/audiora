import { useParams, Link } from 'react-router-dom'
import { personById, items, episodes, byId } from '../data.js'
import { Section, Rail } from '../components/shared.jsx'

export default function Person() {
  const { id } = useParams()
  const p = personById(id)
  if (!p) return <div className="shell empty">Profil nicht gefunden.</div>

  const works = items.filter(
    (i) => i.authorId === p.id || (i.speakerIds || []).includes(p.id) || (i.hostIds || []).includes(p.id),
  )
  const appearances = episodes
    .filter((e) => (e.guestIds || []).includes(p.id))
    .map((e) => ({ ...e, show: byId(e.parent) }))

  return (
    <>
      <div className="shell">
        <div className="profile-head">
          <div
            className="profile-ava"
            style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 72%), hsl(${p.hue + 45} 60% 52%))` }}
          >
            {p.image
              ? <img src={p.image} alt={p.name} />
              : p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="kicker">{p.role}-Profil</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700 }}>{p.name}</h1>
            <p style={{ color: 'var(--text-dim)', maxWidth: 620, marginTop: 8 }}>{p.bio}</p>
            {p.claimed && <div className="verified" style={{ marginTop: 8 }}>✓ Verifiziertes Profil</div>}
          </div>
        </div>

        {!p.claimed && (
          <div className="claim-banner">
            <span>
              Dieses Profil wurde automatisch aus importierten Daten erstellt.
              Bist du {p.name}?
            </span>
            <button className="btn primary">Profil beanspruchen</button>
          </div>
        )}
      </div>

      {works.length > 0 && (
        <Section title={`Werke & Formate von ${p.name}`} sub="Automatisch über den Audio Graph verknüpft.">
          <Rail items={works} />
        </Section>
      )}

      {appearances.length > 0 && (
        <Section title="Podcastauftritte">
          <div className="platforms">
            {appearances.map((a) => (
              <Link key={a.id} to={`/titel/${a.show.id}`} className="chip accent">
                🎙️ {a.title} — {a.show.title}
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
