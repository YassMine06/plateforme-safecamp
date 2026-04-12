import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { ThumbsUp, ThumbsDown, Users, Zap, Info } from 'lucide-react'

const ALERT_ICONS = { fire: '🔥', theft: '🚨', medical: '🏥', suspicious: '👁', vandalism: '🔨', other: '⚠️' }
const TYPE_COLOR  = { fire: '#ff6b35', theft: '#ff5252', medical: '#00e676', suspicious: '#ffd740', vandalism: '#ce93d8', other: '#8899b4' }

const timeAgo = ts => {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'à l\'instant'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

export default function Community() {
  const { call }   = useApi()
  const { user }   = useAuth()
  const [alerts, setAlerts]   = useState([])
  const [voted, setVoted]     = useState({})     // id → 'confirm'|'reject'|erreur
  const [loading, setLoading] = useState({})
  const [filter, setFilter]   = useState('all')  // all | mine

  const load = () => call('/alerts?status=pending').then(d => d && setAlerts(d))
  useEffect(() => { load() }, [])

  const vote = async (id, v) => {
    setLoading(p => ({ ...p, [id]: true }))
    const res = await call(`/alerts/${id}/vote`, { method: 'POST', body: { vote: v } })
    setLoading(p => ({ ...p, [id]: false }))
    if (res?.message) { setVoted(p => ({ ...p, [id]: v })); load() }
    else               setVoted(p => ({ ...p, [id]: res?.error || 'Erreur' }))
  }

  const displayed = filter === 'mine'
    ? alerts.filter(a => a.created_by === user?.anonymous_id)
    : alerts

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Validation communauté</div>
        <div className="page-sub">Aidez le campus à vérifier les incidents</div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
          <Users size={18} color="var(--accent)" />
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Mono' }}>{alerts.length}</div>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>À valider</div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
          <Zap size={18} color="var(--yellow)" />
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>+5 pts</div>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>Confirmer</div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
          <Info size={18} color="var(--text2)" />
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, lineHeight: 1.4 }}>
            <span style={{ color: 'var(--green)' }}>3✓</span> actif<br />
            <span style={{ color: 'var(--red)' }}>5✗</span> rejeté
          </div>
        </div>
      </div>

      {/* ── Filter ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, fontSize: 13, padding: '10px' }}
          onClick={() => setFilter('all')}
        >
          Tous ({alerts.length})
        </button>
        <button
          className={`btn ${filter === 'mine' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, fontSize: 13, padding: '10px' }}
          onClick={() => setFilter('mine')}
        >
          Mes alertes ({alerts.filter(a => a.created_by === user?.anonymous_id).length})
        </button>
      </div>

      {/* ── Empty state ── */}
      {displayed.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Tout est à jour !</div>
          <div className="empty-state-sub">
            {filter === 'mine' ? "Vous n'avez pas créé d'alertes en attente." : "Aucune alerte en attente pour l'instant."}
          </div>
        </div>
      )}

      {/* ── Alert cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayed.map(a => {
          const myVote     = voted[a.id]
          const isOwn      = a.created_by === user?.anonymous_id
          const confirmPct = (a.confirmations / 3) * 100
          const rejectPct  = (a.rejections  / 5) * 100
          const typeCol    = TYPE_COLOR[a.type] || '#8899b4'

          return (
            <div key={a.id} className="card animate-in" style={{ borderLeft: `3px solid ${typeCol}`, padding: '14px 14px 14px 16px' }}>

              {/* Header row */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: `${typeCol}18`, border: `1px solid ${typeCol}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {ALERT_ICONS[a.type] || '⚠️'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: typeCol }}>
                      {a.type?.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      {isOwn && <span className="badge badge-blue" style={{ fontSize: 10 }}>Ma alerte</span>}
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{timeAgo(a.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>📍 {a.location}</div>
                </div>
              </div>

              {/* Description */}
              {a.description && (
                <div style={{
                  fontSize: 13, color: 'var(--text2)', marginBottom: 10,
                  padding: '8px 10px', background: 'var(--bg2)',
                  borderRadius: 8, fontStyle: 'italic', lineHeight: 1.5,
                }}>
                  "{a.description}"
                </div>
              )}

              {/* Progress bars */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                    <span>Confirmations</span>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>{a.confirmations}/3</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ background: 'var(--green)', width: `${Math.min(100, confirmPct)}%` }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                    <span>Rejets</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>{a.rejections}/5</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ background: 'var(--red)', width: `${Math.min(100, rejectPct)}%` }} />
                  </div>
                </div>
              </div>

              {/* Vote buttons */}
              {isOwn ? (
                <div style={{
                  fontSize: 12, color: 'var(--text2)',
                  padding: '8px 12px', background: 'var(--bg2)',
                  borderRadius: 8, textAlign: 'center',
                }}>
                  ℹ️ Vous ne pouvez pas voter pour votre propre alerte
                </div>
              ) : myVote ? (
                <div style={{
                  fontSize: 13, padding: '10px 14px', borderRadius: 10, textAlign: 'center',
                  background: myVote === 'confirm' ? 'rgba(0,230,118,.08)' : 'rgba(255,82,82,.08)',
                  border: `1px solid ${myVote === 'confirm' ? 'var(--green)' : 'var(--red)'}`,
                  color: myVote === 'confirm' ? 'var(--green)' : 'var(--red)',
                  fontWeight: 600,
                }}>
                  {myVote === 'confirm' ? '✅ Confirmée (+5 pts)' : myVote === 'reject' ? '❌ Rejetée (+3 pts)' : `⚠️ ${myVote}`}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, fontSize: 14, gap: 6 }}
                    onClick={() => vote(a.id, 'confirm')}
                    disabled={!!loading[a.id]}
                  >
                    <ThumbsUp size={16} /> Confirmer
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, fontSize: 14, gap: 6 }}
                    onClick={() => vote(a.id, 'reject')}
                    disabled={!!loading[a.id]}
                  >
                    <ThumbsDown size={16} /> Rejeter
                  </button>
                </div>
              )}

              {loading[a.id] && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
                  Traitement…
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
