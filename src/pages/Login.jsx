import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react'

export default function Login() {
  const [mode, setMode]     = useState('register')
  const [pw, setPw]         = useState('')
  const [anonId, setAnonId] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body     = mode === 'register' ? { password: pw } : { anonymous_id: anonId, password: pw }
      const res  = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      login(data.token, data.anonymous_id, remember)
      navigate('/dashboard')
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background décor */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -160, right: -160,
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,.1) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: -120, left: -120,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,153,204,.07) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.25,
        }} />
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '32px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }} className="animate-in">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72,
              background: 'rgba(0,212,255,.1)',
              border: '1px solid rgba(0,212,255,.3)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <Shield size={34} color="var(--accent)" />
            </div>
            <h1 className="mono" style={{ fontSize: 24, fontWeight: 700 }}>SafeCamp</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
              Sécurité campus · 100% anonyme
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--bg2)',
            borderRadius: 12, padding: 4,
            marginBottom: 22,
          }}>
            {[
              { id: 'register', label: 'Créer un compte' },
              { id: 'login',    label: 'Se connecter' }
            ].map(tab => (
              <button key={tab.id}
                onClick={() => { setMode(tab.id); setError('') }}
                style={{
                  flex: 1, padding: '10px 8px',
                  border: 'none', cursor: 'pointer',
                  borderRadius: 9, fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                  background: mode === tab.id ? 'var(--card)' : 'transparent',
                  color:      mode === tab.id ? 'var(--text)' : 'var(--text2)',
                  boxShadow:  mode === tab.id ? '0 1px 4px rgba(0,0,0,.25)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Register */}
          {mode === 'register' && (
            <div className="animate-in">
              {/* Info box */}
              <div style={{
                display: 'flex', gap: 10, padding: '12px 14px',
                background: 'rgba(0,212,255,.06)',
                border: '1px solid rgba(0,212,255,.2)',
                borderRadius: 12, marginBottom: 18,
                fontSize: 13, color: 'var(--accent)',
              }}>
                <Shield size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 3 }}>100% Anonyme</div>
                  <div style={{ color: 'var(--text2)', fontSize: 12, lineHeight: 1.5 }}>
                    Aucun email, aucun nom. Un ID aléatoire comme{' '}
                    <span className="mono" style={{ color: 'var(--accent)' }}>ANON-X7P9</span>{' '}
                    sera généré pour vous.
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Lock size={13} /> Définir un mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 4 caractères"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text2)', padding: 4,
                    }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login */}
          {mode === 'login' && (
            <div className="animate-in">
              <div className="form-group">
                <label className="form-label"><User size={13} /> Votre ID anonyme</label>
                <input
                  type="text"
                  className="form-input mono"
                  placeholder="ANON-XXXX"
                  value={anonId}
                  onChange={e => setAnonId(e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-group">
                <label className="form-label"><Lock size={13} /> Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Votre mot de passe"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text2)', padding: 4,
                    }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,82,82,.1)',
              border: '1px solid rgba(255,82,82,.3)',
              borderRadius: 10, color: 'var(--red)',
              fontSize: 13, marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          {/* Remember me */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16, cursor: 'pointer', fontSize: 14, color: 'var(--text2)',
          }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 18, height: 18, cursor: 'pointer' }}
            />
            Se souvenir de moi (7 jours)
          </label>

          {/* Submit */}
          <button
            className="btn btn-primary btn-full"
            style={{ fontSize: 16, padding: '14px' }}
            onClick={submit}
            disabled={loading || !pw || (mode === 'login' && !anonId)}
          >
            {loading
              ? 'Traitement…'
              : mode === 'register'
                ? '✨ Générer mon ID & Entrer'
                : '🔐 Connexion sécurisée'}
          </button>
        </div>
      </div>
    </div>
  )
}
