import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  byId, personById, similarTo, explainRecommendation, fmtDuration,
  TYPE_LABEL, MOODS,
} from '../data.js'
import { trackRecent } from '../lib/recent.js'
import { fetchCommunityLists as fetchAllLists } from '../lib/community.js'
import { Cover, PlatformButtons, Section, Rail } from '../components/shared.jsx'
import { useAuth, useUserItem } from '../auth.jsx'
import { fetchMyLists, createList, setListItem, isMissingSchema } from '../lib/community.js'
import { useEffect } from 'react'

// Popover: Titel zu eigenen Listen hinzufügen
function CollectionPicker({ itemId, onClose }) {
  const { user } = useAuth()
  const [myLists, setMyLists] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [hint, setHint] = useState('')

  useEffect(() => {
    fetchMyLists(user.id)
      .then(setMyLists)
      .catch((e) => setHint(isMissingSchema(e) ? 'Bitte zuerst supabase/schema_v2.sql ausführen.' : e.message))
  }, [user.id])

  const toggle = async (list) => {
    const on = !list.itemIds.includes(itemId)
    setMyLists((ls) => ls.map((l) => (
      l.id === list.id
        ? { ...l, itemIds: on ? [...l.itemIds, itemId] : l.itemIds.filter((i) => i !== itemId) }
        : l
    )))
    try { await setListItem(list.id, itemId, on) } catch (e) { setHint(e.message) }
  }

  const create = async (e) => {
    e.preventDefault()
    if (newTitle.trim().length < 3) return
    try {
      const id = await createList(user.id, newTitle.trim())
      await setListItem(id, itemId, true)
      setMyLists((ls) => [{ id, title: newTitle.trim(), itemIds: [itemId] }, ...(ls || [])])
      setNewTitle('')
    } catch (err) {
      setHint(isMissingSchema(err) ? 'Bitte zuerst supabase/schema_v2.sql ausführen.' : err.message)
    }
  }

  return (
    <div className="picker">
      <div className="picker-head">
        <b>Zu Liste hinzufügen</b>
        <button onClick={onClose} title="Schließen">✕</button>
      </div>
      {hint && <div className="auth-error" style={{ margin: '8px 0' }}>{hint}</div>}
      {myLists === null && !hint && <div style={{ color: 'var(--text-faint)', padding: '8px 0' }}>Lädt…</div>}
      {myLists?.map((l) => {
        const on = l.itemIds.includes(itemId)
        return (
          <button key={l.id} className="picker-row" onClick={() => toggle(l)}>
            <span className={`picker-check ${on ? 'on' : ''}`}>{on ? '✓' : ''}</span>
            <span className="picker-title">{l.title}</span>
            <span className="picker-count">{l.itemIds.length}</span>
          </button>
        )
      })}
      {myLists?.length === 0 && <div style={{ color: 'var(--text-faint)', padding: '6px 0', fontSize: 13.5 }}>Du hast noch keine Listen.</div>}
      <form className="picker-new" onSubmit={create}>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Neue Liste erstellen…" maxLength={80} />
        <button className="btn" type="submit">＋</button>
      </form>
    </div>
  )
}

export default function Detail() {
  const { id } = useParams()
  const item = byId(id)
  const nav = useNavigate()
  const { user, isConfigured, profile } = useAuth()
  const [marks, toggleMark] = useUserItem(id)
  const heard = user ? marks.heard : false
  const fav = user ? marks.fav : false
  const liked = user ? marks.liked : false
  const toggle = (field) => {
    if (user) toggleMark(field)
    else nav('/anmelden')
  }
  const [expanded, setExpanded] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [inLists, setInLists] = useState([])

  // Echtes Verhalten: besuchte Titel für „Zuletzt angesehen“ merken
  useEffect(() => { if (id) trackRecent(id) }, [id])

  // Echte Community-Listen, die diesen Titel enthalten
  useEffect(() => {
    setInLists([])
    fetchAllLists()
      .then((ls) => setInLists(ls.filter((l) => l.itemIds.includes(id))))
      .catch(() => {})
  }, [id])

  if (!item) return <div className="shell empty">Titel nicht gefunden.</div>

  const author = item.authorId ? personById(item.authorId) : null
  const speakers = (item.speakerIds || []).map(personById)
  const hosts = (item.hostIds || []).map(personById)
  const similar = similarTo(item)
  const listenHref = item.links?.librivox || item.links?.apple || item.links?.applebooks || item.links?.spotify
  const longDesc = (item.desc || '').length > 180

  const stats = [
    item.chartRank != null && { v: `🏆 Platz ${item.chartRank}`, k: item.type === 'hoerbuch' ? 'Deutsche Hörbuch-Charts' : 'Deutsche Podcast-Charts' },
    item.free && { v: '🆓 Kostenlos', k: 'gemeinfrei · LibriVox' },
    item.rating != null && { v: `⭐ ${item.rating.toFixed(1).replace('.', ',')}`, k: `${(item.ratings || 0).toLocaleString('de-DE')} Bewertungen` },
    item.episodes != null && { v: `🎙 ${item.episodes.toLocaleString('de-DE')}`, k: 'Folgen' },
    item.chapters != null && { v: `📑 ${item.chapters}`, k: 'Kapitel' },
    item.duration != null && { v: `⏱ ${fmtDuration(item.duration)}`, k: item.episodes ? 'pro Folge' : 'Gesamtlänge' },
    item.year != null && { v: `📅 ${item.year}`, k: item.episodes ? 'aktiv seit' : 'erschienen' },
  ].filter(Boolean)

  return (
    <div className="detail-bg">
      <div className="shell detail-hero">
        <Cover item={item} showType={false} />
        <div>
          <div className="kicker">{TYPE_LABEL[item.type]}{item.real ? ' · Live-Daten' : ''}</div>

          <div className="title-row">
            <h1>{item.title}</h1>
            <div className="quick-actions">
              <button className={`icon-btn ${heard ? 'on' : ''}`} title='Als „Gehört“ markieren' onClick={() => toggle('heard')}>✓</button>
              <button className={`icon-btn ${liked ? 'on' : ''}`} title="Liken" onClick={() => toggle('liked')}>👍</button>
              <button className="icon-btn" title="Mehr">⋯</button>
            </div>
          </div>

          <div className="byline">
            {author && <>von <Link to={`/person/${author.id}`}>{author.name}</Link></>}
            {!author && <>von {item.by}</>}
            {item.speaker && <> · gelesen von <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.speaker}</span></>}
            {speakers.length > 0 && <> · gelesen von {speakers.map((s, i) => (
              <span key={s.id}>{i > 0 && ', '}<Link to={`/person/${s.id}`}>{s.name}</Link></span>
            ))}</>}
            {hosts.length > 0 && <> · mit {hosts.map((h, i) => (
              <span key={h.id}>{i > 0 && ', '}<Link to={`/person/${h.id}`}>{h.name}</Link></span>
            ))}</>}
          </div>

          {stats.length > 0 && (
            <div className="statbar">
              {stats.map((s) => (
                <div className="stat" key={s.k}>
                  <span className="v">{s.v}</span>
                  <span className="k">{s.k}</span>
                </div>
              ))}
            </div>
          )}

          <div className="desc-block">
            <p className={`desc ${longDesc && !expanded ? 'clamped' : ''}`}>{item.desc}</p>
            {longDesc && (
              <button className="desc-toggle" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Weniger anzeigen ↑' : 'Mehr anzeigen ↓'}
              </button>
            )}
          </div>

          <div className="actions">
            <a
              className="btn cta"
              href={listenHref || '#anhoeren'}
              target={listenHref ? '_blank' : undefined}
              rel={listenHref ? 'noreferrer' : undefined}
            >
              ▶ Jetzt anhören
            </a>
            <button className={`btn ${fav ? 'on' : ''}`} onClick={() => toggle('fav')}>
              {fav ? '♥ Favorit' : '♡ Favorit'}
            </button>
            <span style={{ position: 'relative' }}>
              <button
                className={`btn ${pickerOpen ? 'on' : ''}`}
                onClick={() => {
                  if (!user) { if (isConfigured) nav('/anmelden'); return }
                  setPickerOpen(!pickerOpen)
                }}
              >
                ＋ Sammlung
              </button>
              {pickerOpen && user && <CollectionPicker itemId={item.id} onClose={() => setPickerOpen(false)} />}
            </span>
            <Link to={`/graph?titel=${item.id}`} className="btn">✦ Audio Graph</Link>
          </div>

          <div style={{ marginTop: 44 }} id="anhoeren">
            <div className="kicker" style={{ marginBottom: 14 }}>Anhören bei</div>
            <PlatformButtons ids={item.platforms} links={item.links} />
          </div>

          <div className="reco-card">
            <div className="rc-kicker">✨ Für dich empfohlen</div>
            <p>
              {explainRecommendation(item)}
              {profile?.username ? <> Basierend auf deiner Audio-DNA, <b>{profile.username}</b>.</> : <> Melde dich an, damit Empfehlungen zu deinem Geschmack passen.</>}
            </p>
            <Link to={`/suche?q=${encodeURIComponent(item.genres[0])}`} className="btn">
              Mehr ähnliche Titel →
            </Link>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {item.genres.map((g) => <Link key={g} to={`/suche?q=${encodeURIComponent(g)}`} className="chip">{g}</Link>)}
            {(item.topics || []).map((t) => <Link key={t} to={`/suche?q=${encodeURIComponent(t)}`} className="chip"># {t}</Link>)}
            {item.moods.map((m) => {
              const mood = MOODS.find((x) => x.id === m)
              return mood ? <Link key={m} to={`/suche?mood=${m}`} className="chip">{mood.emoji} {mood.label}</Link> : null
            })}
          </div>
        </div>
      </div>

      {(item.latest || []).length > 0 && (
        <Section title="Neueste Folgen" sub="Live aus dem RSS-Feed importiert.">
          <div className="episodes">
            {item.latest.map((ep, i) => (
              <a
                key={i}
                className="episode-row"
                href={listenHref || '#'}
                target={listenHref ? '_blank' : undefined}
                rel={listenHref ? 'noreferrer' : undefined}
                onClick={listenHref ? undefined : (e) => e.preventDefault()}
              >
                <span className="ep-play">▶</span>
                <span className="ep-title">{ep.title}</span>
                <span className="ep-meta">{ep.duration ? `${ep.duration} Min.` : ''}{ep.duration && ep.date ? ' · ' : ''}{ep.date || ''}</span>
                <span className="ep-actions">
                  <button onClick={(e) => e.preventDefault()} title="Favorit">♡</button>
                  <button onClick={(e) => e.preventDefault()} title="Mehr">⋯</button>
                </span>
              </a>
            ))}
          </div>
        </Section>
      )}

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
    </div>
  )
}
