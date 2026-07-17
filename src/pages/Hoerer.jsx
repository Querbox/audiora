import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { byId } from '../data.js'
import { Cover } from '../components/shared.jsx'
import { useAuth } from '../auth.jsx'
import { fetchPublicProfile, setFollow, isMissingSchema } from '../lib/community.js'

export default function Hoerer() {
  const { username } = useParams()
  const nav = useNavigate()
  const { user, isConfigured } = useAuth()
  const [prof, setProf] = useState(undefined)
  const [schemaMissing, setSchemaMissing] = useState(false)

  useEffect(() => {
    if (!isConfigured) { setProf(null); return }
    fetchPublicProfile(username)
      .then(setProf)
      .catch((e) => { if (isMissingSchema(e)) setSchemaMissing(true); setProf(null) })
  }, [username, isConfigured])

  if (schemaMissing) {
    return (
      <div className="shell">
        <div className="claim-banner" style={{ marginTop: 40 }}>
          <span>Die Community-Tabellen fehlen noch: Bitte <code>supabase/schema_v2.sql</code> im SQL-Editor ausführen.</span>
        </div>
      </div>
    )
  }
  if (prof === undefined) return <div className="shell empty">Lädt…</div>
  if (!prof) return <div className="shell empty">Profil nicht gefunden.</div>

  const isMe = user && user.id === prof.id
  const followedByMe = user ? prof.followers.includes(user.id) : false

  const toggleFollow = async () => {
    if (!user) { nav('/anmelden'); return }
    const next = !followedByMe
    setProf({
      ...prof,
      followers: next ? [...prof.followers, user.id] : prof.followers.filter((id) => id !== user.id),
    })
    try { await setFollow(user.id, prof.id, next) } catch { /* optimistisch */ }
  }

  const since = prof.created_at
    ? new Date(prof.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="shell">
      <div className="profile-head">
        <div
          className="profile-ava"
          style={{ background: 'linear-gradient(135deg, #7c5cff, #f472b6)' }}
        >
          {prof.username[0].toUpperCase()}
        </div>
        <div>
          <div className="kicker">Hörer-Profil</div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700 }}>@{prof.username}</h1>
          <div className="meta-row" style={{ marginBottom: 0 }}>
            <span><b style={{ color: 'var(--text)' }}>{prof.followers.length}</b> Follower</span>
            <span>folgt <b style={{ color: 'var(--text)' }}>{prof.following.length}</b></span>
            <span>{prof.lists.length} Listen</span>
            {since && <span>dabei seit {since}</span>}
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            {isMe
              ? <Link to="/dna" className="btn">Meine Audio-DNA →</Link>
              : <button className={`btn ${followedByMe ? 'on' : 'primary'}`} onClick={toggleFollow}>
                  {followedByMe ? '✓ Du folgst @' + prof.username : '＋ Folgen'}
                </button>}
          </div>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 20 }}>
        <h2>Listen von @{prof.username}</h2>
      </div>
      {prof.lists.length ? (
        <div className="list-grid">
          {prof.lists.map((l) => {
            const covers = l.itemIds.slice(0, 4).map(byId).filter(Boolean)
            return (
              <Link key={l.id} to={`/listen/${l.id}`} className="list-card">
                <div className="list-covers">
                  {covers.length
                    ? covers.map((i) => <Cover key={i.id} item={i} showType={false} />)
                    : <div className="list-covers-empty">Noch keine Titel</div>}
                </div>
                <h3>{l.title}</h3>
                <div className="lc-meta">
                  <span>♥ {l.likes.toLocaleString('de-DE')}</span>
                  <span>{l.itemIds.length} Titel</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-faint)', margin: '10px 0 40px' }}>Noch keine öffentlichen Listen.</p>
      )}
    </div>
  )
}
