import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  byId, personById, similarTo, explainRecommendation, fmtDuration,
  TYPE_LABEL, MOODS, lists, currentUser,
} from '../data.js'
import { Cover, PlatformButtons, Section, Rail } from '../components/shared.jsx'

export default function Detail() {
  const { id } = useParams()
  const item = byId(id)
  const [heard, setHeard] = useState(currentUser.heard.includes(id))
  const [fav, setFav] = useState(currentUser.favorites.includes(id))
  const [liked, setLiked] = useState(currentUser.liked === id)

  if (!item) return <div className="shell empty">Titel nicht gefunden.</div>

  const author = item.authorId ? personById(item.authorId) : null
  const speakers = (item.speakerIds || []).map(personById)
  const hosts = (item.hostIds || []).map(personById)
  const similar = similarTo(item)
  const inLists = lists.filter((l) => l.itemIds.includes(item.id))

  return (
    <>
      <div className="shell detail-hero">
        <Cover item={item} showType={false} />
        <div>
          <div className="kicker">{TYPE_LABEL[item.type]}{item.episodes ? ` · ${item.episodes} Folgen` : ''}</div>
          <h1>{item.title}</h1>
          <div className="byline">
            {author && <>von <Link to={`/person/${author.id}`}>{author.name}</Link></>}
            {!author && <>von {item.by}</>}
            {speakers.length > 0 && <> · gelesen von {speakers.map((s, i) => (
              <span key={s.id}>{i > 0 && ', '}<Link to={`/person/${s.id}`}>{s.name}</Link></span>
            ))}</>}
            {hosts.length > 0 && <> · mit {hosts.map((h, i) => (
              <span key={h.id}>{i > 0 && ', '}<Link to={`/person/${h.id}`}>{h.name}</Link></span>
            ))}</>}
          </div>

          <div className="meta-row">
            <span className="rating-big"><span className="star">★</span> {item.rating.toFixed(1)}</span>
            <span>{item.ratings.toLocaleString('de-DE')} Bewertungen</span>
            <span>{fmtDuration(item.duration)}{item.episodes ? ' pro Folge' : ''}</span>
            <span>{item.year}</span>
          </div>

          <p className="desc">{item.desc}</p>

          <div className="actions">
            <button className={`btn ${heard ? 'on' : ''}`} onClick={() => setHeard(!heard)}>
              {heard ? '✓ Gehört' : 'Als „Gehört“ markieren'}
            </button>
            <button className={`btn ${fav ? 'on' : ''}`} onClick={() => setFav(!fav)}>
              {fav ? '♥ Favorit' : '♡ Favorit'}
            </button>
            <button className={`btn ${liked ? 'on' : ''}`} onClick={() => setLiked(!liked)}>
              {liked ? '👍 Gefällt dir' : '👍 Liken'}
            </button>
            <button className="btn">＋ Zu Liste hinzufügen</button>
            <Link to={`/graph?titel=${item.id}`} className="btn primary">Im Audio Graph ansehen ✦</Link>
          </div>

          <div className="ki-note">
            <span className="spark">✦</span>
            <span><b>KI-Empfehlung:</b> {explainRecommendation(item)}</span>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>Anhören bei</div>
            <PlatformButtons ids={item.platforms} />
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {item.genres.map((g) => <Link key={g} to={`/suche?q=${encodeURIComponent(g)}`} className="chip">{g}</Link>)}
            {(item.topics || []).map((t) => <Link key={t} to={`/suche?q=${encodeURIComponent(t)}`} className="chip"># {t}</Link>)}
            {item.moods.map((m) => {
              const mood = MOODS.find((x) => x.id === m)
              return mood ? <Link key={m} to={`/suche?mood=${m}`} className="chip">{mood.emoji} {mood.label}</Link> : null
            })}
          </div>
        </div>
      </div>

      {inLists.length > 0 && (
        <Section title="In Community-Listen" moreTo="/listen">
          <div className="platforms">
            {inLists.map((l) => (
              <Link key={l.id} to={`/listen/${l.id}`} className="chip accent">📋 {l.title} · ♥ {l.likes.toLocaleString('de-DE')}</Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Das könnte dir auch gefallen" sub="Von der Audiora-KI aus dem Audio Graph abgeleitet.">
        <Rail items={similar} />
      </Section>
    </>
  )
}
