import { useParams, Link } from 'react-router-dom'
import { lists, byId, currentUser } from '../data.js'
import { Cover, TitleCard } from '../components/shared.jsx'

export function ListsOverview() {
  return (
    <div className="shell">
      <div className="page-head">
        <div className="kicker">Community</div>
        <h1>Listen aus der Community</h1>
        <p>Kuratiert von echten Hörerinnen und Hörern. Erstelle eigene Listen, folge anderen und teile deine Entdeckungen.</p>
      </div>

      <div style={{ margin: '14px 0 6px' }}>
        <button className="btn primary">＋ Eigene Liste erstellen</button>
      </div>

      <div className="list-grid">
        {lists.map((l) => (
          <Link key={l.id} to={`/listen/${l.id}`} className="list-card">
            <div className="list-covers">
              {l.itemIds.slice(0, 4).map((id) => <Cover key={id} item={byId(id)} showType={false} />)}
            </div>
            <h3>{l.title}</h3>
            <div className="lc-meta">
              <span>von {l.curator}</span>
              <span>♥ {l.likes.toLocaleString('de-DE')}</span>
              <span>{l.itemIds.length} Titel</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="section" style={{ padding: '10px 0 50px' }}>
        <div className="section-head"><h2>Aktivitäten von Menschen, denen du folgst</h2></div>
        <div className="activity">
          {currentUser.activity.map((a, i) => (
            <div key={i} className="activity-row">
              <span className="avatar" style={{ background: `hsl(${(i * 90 + 200) % 360} 60% 65%)` }}>{a.user[0]}</span>
              <span><span className="who">{a.user}</span> {a.action}</span>
              <span className="when">{a.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ListDetail() {
  const { id } = useParams()
  const list = lists.find((l) => l.id === id)
  if (!list) return <div className="shell empty">Liste nicht gefunden.</div>

  return (
    <div className="shell">
      <div className="page-head">
        <div className="kicker">Community-Liste</div>
        <h1>{list.title}</h1>
        <p>kuratiert von <b style={{ color: 'var(--text)' }}>{list.curator}</b> · ♥ {list.likes.toLocaleString('de-DE')} · {list.itemIds.length} Titel</p>
      </div>
      <div className="actions">
        <button className="btn">♥ Liste liken</button>
        <button className="btn">{list.curator} folgen</button>
        <button className="btn">Teilen</button>
      </div>
      <div className="results-grid">
        {list.itemIds.map((iid) => <TitleCard key={iid} item={byId(iid)} />)}
      </div>
    </div>
  )
}
