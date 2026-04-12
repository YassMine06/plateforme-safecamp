import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Shield, Bell, CheckSquare, Copy, Check } from 'lucide-react'

const LEVELS = [
  { name: 'Débutant',     min: 0,   icon: '🌱', color: '#8899b4' },
  { name: 'Observateur',  min: 50,  icon: '👁',  color: '#00d4ff' },
  { name: 'Gardien',      min: 150, icon: '🛡️', color: '#00e676' },
  { name: 'Sentinelle',   min: 300, icon: '⚡', color: '#ffd740' },
  { name: 'Héros',        min: 500, icon: '🦸', color: '#ff5252' },
]

const ALERT_ICONS = { fire: '🔥', theft: '🚨', medical: '🏥', suspicious: '👁', vandalism: '🔨', other: '⚠️' }

const timeAgo = ts => {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'à l\'instant'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}j ago`
}

export default function Profile() {
  const { call } = useApi()
  const [profile, setProfile] = useState(null)
  const [copied, setCopied]   = useState(false)
  const [tab, setTab]         = useState('alerts')

  useEffect(() => { call('/profile').then(d => d && setProfile(d)) }, [])

  if (!profile) return (
    <div className="empty-state" style={{ paddingTop: 60 }}>
      <Shield size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
      <div className="empty-state-sub">Chargement du profil…</div>
    </div>
  )

  const lvlIdx  = LEVELS.findLastIndex(l => profile.points >= l.min)
  const lvl     = LEVELS[Math.max(0, lvlIdx)]
  const nextLvl = LEVELS[lvlIdx + 1]
  const progress = nextLvl
    ? Math.min(100, ((profile.points - lvl.min) / (nextLvl.min - lvl.min)) * 100)
    : 100

  const copyId = () => {
    navigator.clipboard.writeText(profile.anonymous_id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Mon Profil</div>
        <div className="page-sub">100% anonyme — aucune donnée personnelle</div>
      </div>

      {/* ── ID Card ── */}
      <div className="card" style={{
        marginBottom: 12,
        background: 'linear-gradient(135deg, var(--bg3) 0%, var(--card) 100%)',
        borderColor: 'rgba(0,212,255,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Décor */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 130, height: 130, borderRadius: '50%',
          background: 'rgba(0,212,255,0.05)', pointerEvents: 'none',
        }} />

        {/* Level icon + ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 14, flexShrink: 0,
            background: `${lvl.color}18`, border: `2px solid ${lvl.color}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            {lvl.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              ID ANONYME
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>
                {profile.anonymous_id}
              </span>
              <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 2, flexShrink: 0 }}>
                {copied ? <Check size={16} color="var(--green)" /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{ fontSize: 12, color: lvl.color, fontWeight: 600, marginTop: 2 }}>
              {lvl.icon} {lvl.name}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-3" style={{ gap: 8 }}>
          <div style={{ padding: '10px 8px', background: 'rgba(0,212,255,0.07)', borderRadius: 10, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{profile.points}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Points</div>
          </div>
          <div style={{ padding: '10px 8px', background: `${lvl.color}12`, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{lvl.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: lvl.color }}>{lvl.name}</div>
          </div>
          <div style={{ padding: '10px 8px', background: 'rgba(0,230,118,0.07)', borderRadius: 10, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
              {profile.alerts_created.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Alertes</div>
          </div>
        </div>
      </div>

      {/* ── Level Progress ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Progression de niveau</div>

        {/* All levels mini-icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          {LEVELS.map((l, i) => {
            const reached = profile.points >= l.min
            const current = l.name === lvl.name
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 18, opacity: reached ? 1 : 0.3 }}>{l.icon}</div>
                <div style={{
                  fontSize: 8, color: current ? l.color : 'var(--text2)',
                  fontWeight: current ? 700 : 400,
                }}>
                  {l.name}
                </div>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: current ? l.color : reached ? 'var(--border)' : 'transparent',
                  border: `1px solid ${reached ? l.color : 'var(--border)'}`,
                }} />
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <span style={{ color: lvl.color, fontWeight: 600 }}>{lvl.name} {lvl.icon}</span>
            {nextLvl
              ? <span>{profile.points}/{nextLvl.min} pts → {nextLvl.name}</span>
              : <span style={{ color: 'var(--yellow)' }}>Niveau max ! 🎉</span>}
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ background: lvl.color, width: `${progress}%`, transition: 'width 1.5s ease' }} />
          </div>
        </div>

        {nextLvl && (
          <div style={{
            fontSize: 12, color: 'var(--text2)',
            padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8,
          }}>
            💡 Encore <strong style={{ color: lvl.color }}>{nextLvl.min - profile.points} pts</strong> pour {nextLvl.icon} {nextLvl.name}
          </div>
        )}
      </div>

      {/* ── Activity history ── */}
      <div className="card">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button
            className={`btn ${tab === 'alerts' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: 13, padding: '10px' }}
            onClick={() => setTab('alerts')}
          >
            <Bell size={14} /> Alertes ({profile.alerts_created.length})
          </button>
          <button
            className={`btn ${tab === 'votes' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: 13, padding: '10px' }}
            onClick={() => setTab('votes')}
          >
            <CheckSquare size={14} /> Votes ({profile.votes.length})
          </button>
        </div>

        {/* Alerts tab */}
        {tab === 'alerts' && (
          <>
            {profile.alerts_created.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <div className="empty-state-sub">
                  Pas encore d'alertes —{' '}
                  <a href="/alert" style={{ color: 'var(--accent)' }}>signalez un incident</a> pour gagner des points !
                </div>
              </div>
            ) : (
              profile.alerts_created.map(a => (
                <div key={a.id} className="list-item">
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ALERT_ICONS[a.type] || '⚠️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.type?.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>📍 {a.location} · {timeAgo(a.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={`badge ${a.status === 'active' ? 'badge-red' : a.status === 'pending' ? 'badge-yellow' : 'badge-blue'}`}>
                      {a.status}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'Space Mono' }}>+10 pts</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Votes tab */}
        {tab === 'votes' && (
          <>
            {profile.votes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗳️</div>
                <div className="empty-state-sub">
                  Pas encore de votes —{' '}
                  <a href="/community" style={{ color: 'var(--accent)' }}>aidez à valider les alertes</a> !
                </div>
              </div>
            ) : (
              profile.votes.map(v => (
                <div key={v.id} className="list-item">
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ALERT_ICONS[v.type] || '⚠️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{v.type?.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>📍 {v.location} · {timeAgo(v.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={`badge ${v.vote === 'confirm' ? 'badge-green' : 'badge-red'}`}>
                      {v.vote === 'confirm' ? '✅ Confirmé' : '❌ Rejeté'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'Space Mono' }}>
                      +{v.vote === 'confirm' ? 5 : 3} pts
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
