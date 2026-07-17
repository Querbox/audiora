import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { byId } from '../data.js'
import { Cover, TitleCard } from '../components/shared.jsx'
import { useAuth } from '../auth.jsx'
import {
  fetchCommunityLists, fetchList, createList, deleteList,
  setListLike, isMissingSchema,
} from '../lib/community.js'

function SchemaHint() {
  return (
    <div className="claim-banner">
      <span>
        Die Community-Tabellen fehlen noch in Supabase: Bitte einmalig{' '}
        <code>supabase/schema_v2.sql</code> im SQL-Editor ausführen.
      </span>
    </div>
  )
}

function LikeButton({ list, onChange }) {
  const { user, isConfigured } = useAuth()
  const nav = useNavigate()
  const liked = user ? list.likedBy?.includes(user.id) : false
  const toggle = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { if (isConfigured) nav('/anmelden'); return }
    const next = !liked
    onChange({
      ...list,
      likes: list.likes + (next ? 1 : -1),
      likedBy: next ? [...list.likedBy, user.id] : list.likedBy.filter((id) => id !== user.id),
    })
    try { await setListLike(list.id, user.id, next) } catch { /* optimistisch */ }
  }
  return (
    <button className={`chip ${liked ? 'accent' : ''}`} onClick={toggle} title="Liste liken">
      {liked ? '♥' : '♡'} {list.likes.toLocaleString('de-DE')}
    </button>
  )
}

function ListCard({ list, onChange }) {
  const covers = list.itemIds.slice(0, 4).map(byId).filter(Boolean)
  return (
    <Link to={`/listen/${list.id}`} className="list-card">
      <div className="list-covers">
        {covers.length
          ? covers.map((i) => <Cover key={i.id} item={i} showType={false} />)
          : <div className="list-covers-empty">Noch keine Titel</div>}
      </div>
      <h3>{list.title}</h3>
      <div className="lc-meta">
        <span>
          von{' '}
          {list.db
            ? <Link to={`/hoerer/${list.curator}`} onClick={(e) => e.stopPropagation()} className="lc-curator">{list.curator}</Link>
            : list.curator}
        </span>
        <span>{list.itemIds.length} Titel</span>
        {list.db
          ? <LikeButton list={list} onChange={onChange} />
          : <span>♥ {list.likes.toLocaleString('de-DE')}</span>}
      </div>
    </Link>
  )
}

export function ListsOverview() {
  const { user, isConfigured, profile } = useAuth()
  const nav = useNavigate()
  const [dbLists, setDbLists] = useState(null)
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => {
    if (!isConfigured) return
    fetchCommunityLists()
      .then(setDbLists)
      .catch((e) => { if (isMissingSchema(e)) setSchemaMissing(true); else console.error(e) })
  }
  useEffect(load, [isConfigured])

  const patch = (updated) =>
    setDbLists((ls) => ls.map((l) => (l.id === updated.id ? updated : l)))

  const create = async (e) => {
    e.preventDefault()
    if (!user) { nav('/anmelden'); return }
    if (title.trim().length < 3) return
    setCreating(true)
    try {
      const id = await createList(user.id, title.trim())
      setTitle('')
      nav(`/listen/${id}`)
    } catch (err) {
      if (isMissingSchema(err)) setSchemaMissing(true)
      else alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="kicker">Community</div>
        <h1>Listen aus der Community</h1>
        <p>Kuratiert von echten Hörerinnen und Hörern. Erstelle eigene Listen, folge anderen und teile deine Entdeckungen.</p>
      </div>

      {schemaMissing && <SchemaHint />}

      {isConfigured && !schemaMissing && (
        <form className="list-create" onSubmit={create}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={user ? 'Titel deiner neuen Liste, z. B. „Perfekt für Regentage“' : 'Melde dich an, um Listen zu erstellen'}
            maxLength={80}
          />
          <button className="btn primary" type="submit" disabled={creating}>
            {user ? '＋ Liste erstellen' : 'Anmelden'}
          </button>
        </form>
      )}

      {dbLists && dbLists.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 28 }}>
            <h2>Neu aus der Community</h2>
          </div>
          <div className="list-grid">
            {dbLists.map((l) => <ListCard key={l.id} list={l} onChange={patch} />)}
          </div>
        </>
      )}
      {dbLists && dbLists.length === 0 && !schemaMissing && (
        <p style={{ color: 'var(--text-faint)', margin: '24px 0 60px' }}>
          Noch keine Community-Listen – erstelle die allererste! 🎉
        </p>
      )}
    </div>
  )
}

export function ListDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, isConfigured } = useAuth()
  const [dbList, setDbList] = useState(undefined) // undefined=lädt, null=nicht gefunden
  const [schemaMissing, setSchemaMissing] = useState(false)

  useEffect(() => {
    if (!isConfigured) { setDbList(null); return }
    fetchList(id)
      .then(setDbList)
      .catch((e) => { if (isMissingSchema(e)) setSchemaMissing(true); setDbList(null) })
  }, [id, isConfigured])

  const list = dbList
  if (schemaMissing) return <div className="shell"><SchemaHint /></div>
  if (dbList === undefined) return <div className="shell empty">Lädt…</div>
  if (!list) return <div className="shell empty">Liste nicht gefunden.</div>

  const isOwner = list.db && user && list.ownerId === user.id
  const items = list.itemIds.map(byId).filter(Boolean)

  const remove = async () => {
    if (!confirm(`Liste „${list.title}“ wirklich löschen?`)) return
    await deleteList(list.id)
    nav('/listen')
  }

  return (
    <div className="shell">
      <div className="page-head">
        <div className="kicker">Community-Liste</div>
        <h1>{list.title}</h1>
        {list.description && <p>{list.description}</p>}
        <p>
          kuratiert von{' '}
          {list.db
            ? <Link to={`/hoerer/${list.curator}`} style={{ color: 'var(--text)', fontWeight: 600 }}>{list.curator}</Link>
            : <b style={{ color: 'var(--text)' }}>{list.curator}</b>}
          {' '}· ♥ {list.likes.toLocaleString('de-DE')} · {list.itemIds.length} Titel
        </p>
      </div>
      <div className="actions" style={{ marginTop: 0 }}>
        {list.db && <LikeButton list={list} onChange={setDbList} />}
        {list.db && <Link to={`/hoerer/${list.curator}`} className="btn">Profil von {list.curator}</Link>}
        {isOwner && <button className="btn" onClick={remove} style={{ color: '#fda4af' }}>Liste löschen</button>}
      </div>
      {items.length ? (
        <div className="results-grid">
          {items.map((i) => <TitleCard key={i.id} item={i} />)}
        </div>
      ) : (
        <div className="empty">
          Noch keine Titel – öffne einen Titel und füge ihn über <b>＋ Sammlung</b> hinzu.
        </div>
      )}
    </div>
  )
}
