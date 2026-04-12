import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Bell, MapPin, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

const ALERT_TYPES = [
  { value: 'theft',      label: 'Vol',         icon: '🚨', color: '#ff5252', desc: 'Objet volé ou pickpocket' },
  { value: 'fire',       label: 'Incendie',    icon: '🔥', color: '#ff6b35', desc: 'Feu ou fumée détectés' },
  { value: 'medical',    label: 'Médical',     icon: '🏥', color: '#00e676', desc: 'Blessure ou urgence médicale' },
  { value: 'suspicious', label: 'Suspect',     icon: '👁',  color: '#ffd740', desc: 'Comportement inhabituel' },
  { value: 'vandalism',  label: 'Vandalisme',  icon: '🔨', color: '#ce93d8', desc: 'Dégradation ou graffiti' },
  { value: 'other',      label: 'Autre',       icon: '⚠️', color: '#8899b4', desc: 'Autre problème de sécurité' },
]

const LOCATIONS = [
  'Amphithéâtre A', 'Amphithéâtre B', 'Bibliothèque', 'Cafétéria',
  'Bloc Labo', 'Salles A', 'Salles B', 'Entrée principale', 'Parking',
]

export default function CreateAlert() {
  const { call } = useApi()
  const [step, setStep]       = useState(1)   // 1=type 2=location 3=desc 4=success
  const [type, setType]       = useState('')
  const [location, setLocation] = useState('')
  const [desc, setDesc]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)

  const selectedType = ALERT_TYPES.find(t => t.value === type)

  const submit = async () => {
    setLoading(true); setError('')
    const res = await call('/alerts', { method: 'POST', body: { type, location, description: desc } })
    setLoading(false)
    if (res?.id) { setResult(res); setStep(4) }
    else setError(res?.error || 'Échec de la soumission')
  }

  /* ─── Step 4 : Success ─── */
  if (step === 4) return (
    <div className="animate-in" style={{ textAlign: 'center', paddingTop: 24 }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 20px',
        background: 'rgba(0,230,118,.1)', border: '2px solid var(--green)',
        borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle size={38} color="var(--green)" />
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Alerte soumise !</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.65, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
        Votre alerte <strong>{type}</strong> à <strong>{location}</strong> est en attente de validation.
        Elle devient active dès{' '}
        <strong style={{ color: 'var(--green)' }}>3 confirmations</strong>.
        Vous gagnez <strong style={{ color: 'var(--accent)' }}>+10 points</strong> !
      </p>

      <div className="card" style={{ marginBottom: 24, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, fontSize: 26,
            background: `${selectedType?.color || '#8899b4'}18`,
            border: `1px solid ${selectedType?.color || '#8899b4'}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {selectedType?.icon || '⚠️'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{type?.toUpperCase()}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>📍 {location}</div>
            {desc && <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', marginTop: 2 }}>"{desc}"</div>}
          </div>
          <span className="badge badge-yellow" style={{ flexShrink: 0 }}>0/3 ✓</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={() => { setType(''); setLocation(''); setDesc(''); setStep(1); setResult(null) }}
        >
          Nouvelle alerte
        </button>
        <a href="/community" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
          Voir la communauté
        </a>
      </div>
    </div>
  )

  /* ─── Steps 1-3 ─── */
  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Signaler un incident</div>
        <div className="page-sub">Anonyme · 3 confirmations pour activer</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        {['Type', 'Lieu', 'Détails'].map((label, i) => {
          const s      = i + 1
          const done   = step > s
          const active = step === s
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, ...(s < 3 ? { flex: 1 } : {}) }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: done ? 'pointer' : 'default' }}
                onClick={() => done && setStep(s)}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, fontFamily: 'Space Mono',
                  background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg2)',
                  color: (done || active) ? '#000' : 'var(--text2)',
                  transition: 'all 0.3s', flexShrink: 0,
                }}>
                  {done ? '✓' : s}
                </div>
                <span style={{ fontSize: 13, color: active ? 'var(--text)' : 'var(--text2)', fontWeight: active ? 600 : 400 }}>
                  {label}
                </span>
              </div>
              {s < 3 && <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 4px' }} />}
            </div>
          )
        })}
      </div>

      <div className="card">

        {/* ── STEP 1: Type ── */}
        {step === 1 && (
          <div className="animate-in">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Quel type d'incident ?</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Sélectionnez la catégorie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALERT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s',
                    border: `2px solid ${type === t.value ? t.color : 'var(--border)'}`,
                    background: type === t.value ? `${t.color}12` : 'var(--bg2)',
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: type === t.value ? t.color : 'var(--text)' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 18, fontSize: 15 }}
              disabled={!type}
              onClick={() => setStep(2)}
            >
              Suivant : Lieu <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Location ── */}
        {step === 2 && (
          <div className="animate-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 24,
                background: `${selectedType?.color || '#8899b4'}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selectedType?.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Où cela s'est-il passé ?</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Incident : {selectedType?.label}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {LOCATIONS.map(l => (
                <button
                  key={l}
                  onClick={() => setLocation(l)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 15, textAlign: 'left', transition: 'all 0.2s',
                    border: `1.5px solid ${location === l ? 'var(--accent)' : 'var(--border)'}`,
                    background: location === l ? 'rgba(0,212,255,.08)' : 'var(--bg2)',
                    color: location === l ? 'var(--accent)' : 'var(--text2)',
                    fontWeight: location === l ? 600 : 400,
                  }}
                >
                  <MapPin size={16} style={{ flexShrink: 0 }} />
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ padding: '12px 16px' }} onClick={() => setStep(1)}>
                <ChevronLeft size={18} />
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, fontSize: 15 }}
                disabled={!location}
                onClick={() => setStep(3)}
              >
                Suivant : Détails <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Description ── */}
        {step === 3 && (
          <div className="animate-in">
            {/* Summary */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px', background: 'var(--bg2)', borderRadius: 12,
              marginBottom: 18,
            }}>
              <span style={{ fontSize: 28 }}>{selectedType?.icon}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{selectedType?.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>📍 {location}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span style={{ color: 'var(--text2)', fontWeight: 400 }}>(facultatif)</span>
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Décrivez brièvement ce que vous avez vu…"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                Plus de détails aident la communauté à mieux décider
              </div>
            </div>

            {/* Anonymous reminder */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '12px 14px',
              background: 'rgba(0,212,255,.05)',
              border: '1px solid rgba(0,212,255,.2)',
              borderRadius: 10, marginBottom: 18,
              fontSize: 13, color: 'var(--accent)',
            }}>
              <Bell size={16} style={{ flexShrink: 0 }} />
              Votre signalement est totalement anonyme.
            </div>

            {error && (
              <div style={{
                padding: '12px', background: 'rgba(255,82,82,.1)',
                border: '1px solid rgba(255,82,82,.3)',
                borderRadius: 10, color: 'var(--red)',
                fontSize: 13, marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ padding: '12px 16px' }} onClick={() => setStep(2)}>
                <ChevronLeft size={18} />
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, fontSize: 15 }}
                onClick={submit}
                disabled={loading}
              >
                {loading ? 'Envoi…' : `🚨 Soumettre l'alerte ${selectedType?.label}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
