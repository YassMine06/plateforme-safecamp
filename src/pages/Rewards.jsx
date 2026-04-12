import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Trophy, Gift, CheckCircle, X } from 'lucide-react'

const REWARDS = [
  { id: 'coffee',   name: 'Café gratuit',      icon: '☕', cost: 15,  desc: 'Café spécialité au café de la bibliothèque', category: 'Nourriture' },
  { id: 'meal',     name: 'Repas cafétéria',   icon: '🍽️', cost: 30,  desc: 'Repas complet gratuit à la cafétéria',       category: 'Nourriture' },
  { id: 'cinema',   name: 'Ticket cinéma',     icon: '🎬', cost: 50,  desc: 'Soirée cinéma gratuite sur le campus',       category: 'Loisirs' },
  { id: 'book',     name: 'Bonus bibliothèque', icon: '📚', cost: 25,  desc: '+7 jours de prêt supplémentaires',          category: 'Académique' },
  { id: 'event',    name: 'Accès événement',   icon: '🎟️', cost: 80,  desc: 'Accès VIP au prochain événement campus',    category: 'Loisirs' },
  { id: 'printing', name: 'Crédits impression',icon: '🖨️', cost: 20,  desc: '50 pages gratuites aux stations d\'impression', category: 'Académique' },
  { id: 'parking',  name: 'Pass parking',      icon: '🚗', cost: 100, desc: 'Un mois de parking campus gratuit',         category: 'Transport' },
  { id: 'gym',      name: 'Pass gym 1 jour',   icon: '💪', cost: 35,  desc: 'Accès journée complète au gymnase campus',  category: 'Bien-être' },
]

const LEVELS = [
  { label: 'Débutant',  pts: 0,   icon: '🌱' },
  { label: 'Observateur', pts: 50,  icon: '👁' },
  { label: 'Gardien',   pts: 150, icon: '🛡️' },
  { label: 'Sentinelle',pts: 300, icon: '⚡' },
  { label: 'Héros',     pts: 500, icon: '🦸' },
]

export default function Rewards() {
  const { call } = useApi()
  const [points, setPoints]   = useState(0)
  const [confirm, setConfirm] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const [filter, setFilter]   = useState('Tous')

  useEffect(() => { call('/profile').then(d => d && setPoints(d.points)) }, [])

  const redeem = async () => {
    if (!confirm) return
    setLoading(true); setErr('')
    const res = await call('/rewards/redeem', { method: 'POST', body: { reward: confirm.name, cost: confirm.cost } })
    setLoading(false)
    if (res?.message) {
      setSuccess(confirm); setPoints(p => p - confirm.cost); setConfirm(null)
    } else {
      setErr(res?.error || 'Erreur'); setConfirm(null)
    }
  }

  const categories = ['Tous', ...new Set(REWARDS.map(r => r.category))]
  const displayed  = filter === 'Tous' ? REWARDS : REWARDS.filter(r => r.category === filter)

  const lvlIdx = LEVELS.findLastIndex(l => points >= l.pts)
  const lvl    = LEVELS[Math.max(0, lvlIdx)]
  const nextLvl = LEVELS[lvlIdx + 1]

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Récompenses</div>
        <div className="page-sub">Échangez vos points contre des avantages campus</div>
      </div>

      {/* ── Points card ── */}
      <div className="card" style={{
        marginBottom: 14,
        background: 'linear-gradient(135deg, rgba(0,212,255,.08), var(--card))',
        borderColor: 'rgba(0,212,255,.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <Trophy size={36} color="var(--yellow)" />
          <div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
              {points}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Points disponibles</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 20 }}>{lvl?.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)' }}>{lvl?.label}</div>
          </div>
        </div>

        {/* Level progress bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
            <span>{lvl?.label} {lvl?.icon}</span>
            {nextLvl
              ? <span>{nextLvl.pts - points} pts → {nextLvl.label}</span>
              : <span style={{ color: 'var(--yellow)' }}>Niveau max 🎉</span>}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              background: 'var(--yellow)',
              width: `${nextLvl ? Math.min(100, ((points - lvl.pts) / (nextLvl.pts - lvl.pts)) * 100) : 100}%`,
            }} />
          </div>
        </div>

        {/* How to earn */}
        <div style={{
          display: 'flex', gap: 12,
          padding: '10px 12px',
          background: 'var(--bg2)', borderRadius: 10,
          fontSize: 12, color: 'var(--text2)',
        }}>
          <div><span style={{ color: 'var(--accent)', fontWeight: 700 }}>+10</span> Créer alerte</div>
          <div><span style={{ color: 'var(--green)',  fontWeight: 700 }}>+5</span>  Confirmer</div>
          <div><span style={{ color: 'var(--yellow)', fontWeight: 700 }}>+3</span>  Rejeter</div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div style={{
          padding: '10px 14px', background: 'rgba(255,82,82,.1)',
          border: '1px solid rgba(255,82,82,.3)', borderRadius: 10,
          color: 'var(--red)', fontSize: 13, marginBottom: 12,
        }}>
          {err}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'rgba(0,230,118,.1)',
          border: '1px solid rgba(0,230,118,.3)', borderRadius: 12,
          marginBottom: 14,
        }}>
          <CheckCircle size={20} color="var(--green)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>
              {success.name} échangé !
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{success.desc}</div>
          </div>
          <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── Category filter (horizontal scroll) ── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 14,
        overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {categories.map(c => (
          <button
            key={c}
            className={`btn ${filter === c ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Rewards grid 2-col ── */}
      <div className="grid-2">
        {displayed.map(r => {
          const canAfford = points >= r.cost
          return (
            <div key={r.id} className="card" style={{
              display: 'flex', flexDirection: 'column',
              opacity: canAfford ? 1 : 0.55,
              padding: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 34 }}>{r.icon}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px',
                  background: 'var(--bg2)', borderRadius: 20,
                  color: 'var(--text2)', fontWeight: 500,
                }}>
                  {r.category}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', flex: 1, marginBottom: 10, lineHeight: 1.5 }}>{r.desc}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{r.cost}</span>
                  <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 2 }}>pts</span>
                </div>
                <button
                  className={`btn ${canAfford ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '7px 12px', fontSize: 12, minHeight: 36 }}
                  onClick={() => canAfford && setConfirm(r)}
                  disabled={!canAfford}
                >
                  <Gift size={13} /> {canAfford ? 'Échanger' : `–${r.cost - points}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal (bottom sheet) ── */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-sheet animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>{confirm.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{confirm.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{confirm.desc}</div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--bg2)',
              borderRadius: 12, marginBottom: 10,
            }}>
              <span style={{ color: 'var(--text2)' }}>Coût</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{confirm.cost} pts</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--bg2)',
              borderRadius: 12, marginBottom: 20,
            }}>
              <span style={{ color: 'var(--text2)' }}>Restant après</span>
              <span className="mono" style={{
                fontWeight: 700,
                color: points - confirm.cost >= 0 ? 'var(--green)' : 'var(--red)',
              }}>
                {points - confirm.cost} pts
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>
                Annuler
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={redeem} disabled={loading}>
                {loading ? 'Traitement…' : <><CheckCircle size={15} /> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
