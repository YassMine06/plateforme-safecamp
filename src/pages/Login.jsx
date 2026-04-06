import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react'

export default function Login() {
  const [mode, setMode] = useState('register')
  const [pw, setPw] = useState('')
  const [anonId, setAnonId] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body = mode === 'register' ? { password: pw } : { anonymous_id: anonId, password: pw }
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      login(data.token, data.anonymous_id, remember)
      navigate('/dashboard')
    } catch { setError('Server error') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-circle c1"/>
        <div className="bg-circle c2"/>
        <div className="bg-grid"/>
      </div>

      <div className="login-card animate-in">
        <div style={{textAlign:'center',marginBottom:32}}>
          <div className="login-icon"><Shield size={32} color="var(--accent)"/></div>
          <h1 className="mono" style={{fontSize:26,fontWeight:700,marginTop:12}}>SafeCamp</h1>
          <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Privacy-First Campus Security</p>
        </div>

        <div className="tab-row">
          <button className={`tab ${mode==='register'?'active':''}`} onClick={() => setMode('register')}>Create Account</button>
          <button className={`tab ${mode==='login'?'active':''}`} onClick={() => setMode('login')}>Sign In</button>
        </div>

        {mode === 'register' ? (
          <div className="animate-in">
            <div className="info-box">
              <Shield size={14} style={{flexShrink:0,marginTop:1}}/>
              <div>
                <div style={{fontWeight:600,marginBottom:2}}>100% Anonymous</div>
                <div style={{color:'var(--text2)',fontSize:12}}>No email, no name. A random ID like <span className="mono" style={{color:'var(--accent)'}}>ANON-X7P9</span> will be generated for you.</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><Lock size={12}/> Set a Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} className="form-input" placeholder="Min 4 characters"
                  value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter'&&submit()}/>
                <button style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text2)'}}
                  onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in">
            <div className="form-group">
              <label className="form-label"><User size={12}/> Your Anonymous ID</label>
              <input type="text" className="form-input mono" placeholder="ANON-XXXX"
                value={anonId} onChange={e => setAnonId(e.target.value.toUpperCase())}/>
            </div>
            <div className="form-group">
              <label className="form-label"><Lock size={12}/> Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} className="form-input" placeholder="Your password"
                  value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter'&&submit()}/>
                <button style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text2)'}}
                  onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,marginTop:8}}>
          <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
            style={{cursor:'pointer',accentColor:'var(--accent)',width:16,height:16}}/>
          <label htmlFor="remember" style={{fontSize:14,color:'var(--text2)',cursor:'pointer'}}>
            Remember me (7 days)
          </label>
        </div>

        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}}
          onClick={submit} disabled={loading || !pw || (mode==='login'&&!anonId)}>
          {loading ? 'Processing...' : mode === 'register' ? 'Generate My ID & Enter' : 'Sign In Securely'}
        </button>
      </div>

      <style>{`
        .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; position:relative; overflow:hidden; }
        .login-bg { position:fixed; inset:0; pointer-events:none; }
        .bg-circle { position:absolute; border-radius:50%; }
        .c1 { width:600px; height:600px; background:radial-gradient(circle, rgba(0,212,255,.08) 0%, transparent 70%); top:-200px; right:-200px; }
        .c2 { width:400px; height:400px; background:radial-gradient(circle, rgba(0,153,204,.06) 0%, transparent 70%); bottom:-100px; left:-100px; }
        .bg-grid { position:absolute; inset:0; background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px); background-size:40px 40px; opacity:.3; }
        .login-card { position:relative; z-index:1; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:36px; width:100%; max-width:400px; }
        .login-icon { width:64px; height:64px; background:rgba(0,212,255,.1); border:1px solid rgba(0,212,255,.3); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto; }
        .tab-row { display:flex; gap:4px; background:var(--bg2); border-radius:8px; padding:4px; margin-bottom:20px; }
        .tab { flex:1; padding:8px; border:none; background:none; cursor:pointer; border-radius:6px; color:var(--text2); font-size:13px; font-weight:500; transition:all 0.2s; font-family:inherit; }
        .tab.active { background:var(--card); color:var(--text); box-shadow:0 1px 4px rgba(0,0,0,.3); }
        .info-box { display:flex; gap:10px; padding:12px; background:rgba(0,212,255,.05); border:1px solid rgba(0,212,255,.2); border-radius:8px; margin-bottom:16px; font-size:13px; color:var(--accent); }
        .error-msg { padding:10px; background:rgba(255,82,82,.1); border:1px solid rgba(255,82,82,.3); border-radius:8px; color:var(--red); font-size:13px; margin-bottom:8px; }
      `}</style>
    </div>
  )
}
