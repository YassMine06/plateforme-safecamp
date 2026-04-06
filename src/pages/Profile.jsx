import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Shield, Bell, CheckSquare, Star, Copy, Check } from 'lucide-react'

const LEVELS = [
  { name:'Beginner', min:0,   icon:'🌱', color:'#8899b4' },
  { name:'Watcher',  min:50,  icon:'👁',  color:'#00d4ff' },
  { name:'Guardian', min:150, icon:'🛡️', color:'#00e676' },
  { name:'Sentinel', min:300, icon:'⚡', color:'#ffd740' },
  { name:'Hero',     min:500, icon:'🦸', color:'#ff5252' },
]

const ALERT_ICONS = { fire:'🔥', theft:'🚨', medical:'🏥', suspicious:'👁', vandalism:'🔨', other:'⚠️' }

const timeAgo = ts => {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff/60000)
  if (m<1) return 'just now'
  if (m<60) return `${m}m ago`
  const h = Math.floor(m/60)
  return h<24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`
}

export default function Profile() {
  const { call } = useApi()
  const [profile, setProfile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [tab, setTab]  = useState('alerts') // alerts | votes

  useEffect(() => { call('/profile').then(d => d && setProfile(d)) }, [])

  if (!profile) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:'var(--text2)'}}>
      <Shield size={18} style={{marginRight:8}}/> Loading profile...
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
        <div className="page-title">👤 Your Profile</div>
        <div className="page-sub">100% anonymous — no personal data stored</div>
      </div>

      <div className="grid-2" style={{marginBottom:20}}>

        {/* ID Card */}
        <div className="card" style={{
          background:'linear-gradient(135deg, var(--bg3) 0%, var(--card) 100%)',
          borderColor:'rgba(0,212,255,0.25)', position:'relative', overflow:'hidden'}}>
          {/* Decorative circles */}
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',
            background:'rgba(0,212,255,0.04)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-20,left:-20,width:80,height:80,borderRadius:'50%',
            background:'rgba(0,212,255,0.03)',pointerEvents:'none'}}/>

          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
            <div style={{width:58,height:58,borderRadius:14,background:`${lvl.color}18`,
              border:`2px solid ${lvl.color}50`,display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:28,flexShrink:0}}>
              {lvl.icon}
            </div>
            <div>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:4,fontWeight:600,letterSpacing:1}}>ANONYMOUS ID</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="mono" style={{fontSize:20,fontWeight:700,color:'var(--accent)',letterSpacing:2}}>
                  {profile.anonymous_id}
                </span>
                <button onClick={copyId} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',padding:2}}>
                  {copied ? <Check size={14} color="var(--green)"/> : <Copy size={14}/>}
                </button>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:16}}>
            <div style={{flex:1,padding:'10px 14px',background:'rgba(0,212,255,0.07)',borderRadius:10,textAlign:'center'}}>
              <div className="mono" style={{fontSize:26,fontWeight:700,color:'var(--accent)'}}>{profile.points}</div>
              <div style={{fontSize:11,color:'var(--text2)'}}>Points</div>
            </div>
            <div style={{flex:1,padding:'10px 14px',background:`${lvl.color}12`,borderRadius:10,textAlign:'center'}}>
              <div style={{fontSize:20,marginBottom:2}}>{lvl.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:lvl.color}}>{lvl.name}</div>
            </div>
            <div style={{flex:1,padding:'10px 14px',background:'rgba(0,230,118,0.07)',borderRadius:10,textAlign:'center'}}>
              <div className="mono" style={{fontSize:26,fontWeight:700,color:'var(--green)'}}>
                {profile.alerts_created.length}
              </div>
              <div style={{fontSize:11,color:'var(--text2)'}}>Alerts</div>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="card">
          <div style={{fontWeight:600,marginBottom:14}}>Level Progress</div>

          {/* All levels */}
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            {LEVELS.map((l,i) => {
              const reached = profile.points >= l.min
              const current = l.name === lvl.name
              return (
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{fontSize:18,opacity:reached?1:0.3}}>{l.icon}</div>
                  <div style={{fontSize:9,color:current?l.color:'var(--text2)',
                    fontWeight:current?700:400,transition:'color 0.3s'}}>{l.name}</div>
                  <div style={{width:6,height:6,borderRadius:'50%',
                    background:current?l.color:reached?'var(--border)':'transparent',
                    border:`1px solid ${reached?l.color:'var(--border)'}`,transition:'all 0.3s'}}/>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text2)',marginBottom:6}}>
              <span style={{color:lvl.color,fontWeight:600}}>{lvl.name} {lvl.icon}</span>
              {nextLvl
                ? <span>{profile.points}/{nextLvl.min} pts → {nextLvl.name}</span>
                : <span style={{color:'var(--yellow)'}}>Max level reached! 🎉</span>
              }
            </div>
            <div style={{height:8,background:'var(--bg2)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:4,background:lvl.color,
                width:`${progress}%`,transition:'width 1.5s ease'}}/>
            </div>
          </div>

          {nextLvl && (
            <div style={{fontSize:12,color:'var(--text2)',padding:'8px 12px',background:'var(--bg2)',borderRadius:8}}>
              💡 You need <strong style={{color:lvl.color}}>{nextLvl.min - profile.points} more points</strong> to reach {nextLvl.icon} {nextLvl.name}
            </div>
          )}
        </div>
      </div>

      {/* Activity history */}
      <div className="card">
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          <button className={`btn ${tab==='alerts'?'btn-primary':'btn-ghost'}`}
            style={{padding:'7px 16px',fontSize:13}} onClick={() => setTab('alerts')}>
            <Bell size={14}/> Alerts ({profile.alerts_created.length})
          </button>
          <button className={`btn ${tab==='votes'?'btn-primary':'btn-ghost'}`}
            style={{padding:'7px 16px',fontSize:13}} onClick={() => setTab('votes')}>
            <CheckSquare size={14}/> Votes ({profile.votes.length})
          </button>
        </div>

        {tab === 'alerts' && (
          <>
            {profile.alerts_created.length === 0 && (
              <div style={{textAlign:'center',padding:'32px 20px',color:'var(--text2)'}}>
                <div style={{fontSize:36,marginBottom:8}}>🔔</div>
                <div>No alerts yet — <a href="/alert" style={{color:'var(--accent)'}}>report an incident</a> to earn points!</div>
              </div>
            )}
            {profile.alerts_created.map(a => (
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,
                padding:'10px 12px',background:'var(--bg2)',borderRadius:8,marginBottom:8}}>
                <span style={{fontSize:20,flexShrink:0}}>{ALERT_ICONS[a.type]||'⚠️'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14}}>{a.type?.toUpperCase()}</div>
                  <div style={{fontSize:12,color:'var(--text2)'}}>📍 {a.location} · {timeAgo(a.created_at)}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                  <span className={`badge ${a.status==='active'?'badge-red':a.status==='pending'?'badge-yellow':'badge-blue'}`}>
                    {a.status}
                  </span>
                  <span style={{fontSize:11,color:'var(--green)',fontFamily:'Space Mono'}}>+10 pts</span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'votes' && (
          <>
            {profile.votes.length === 0 && (
              <div style={{textAlign:'center',padding:'32px 20px',color:'var(--text2)'}}>
                <div style={{fontSize:36,marginBottom:8}}>🗳️</div>
                <div>No votes yet — <a href="/community" style={{color:'var(--accent)'}}>help validate alerts</a> and earn points!</div>
              </div>
            )}
            {profile.votes.map(v => (
              <div key={v.id} style={{display:'flex',alignItems:'center',gap:12,
                padding:'10px 12px',background:'var(--bg2)',borderRadius:8,marginBottom:8}}>
                <span style={{fontSize:20,flexShrink:0}}>{ALERT_ICONS[v.type]||'⚠️'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14}}>{v.type?.toUpperCase()}</div>
                  <div style={{fontSize:12,color:'var(--text2)'}}>📍 {v.location} · {timeAgo(v.created_at)}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                  <span className={`badge ${v.vote==='confirm'?'badge-green':'badge-red'}`}>
                    {v.vote==='confirm'?'✅ Confirmed':'❌ Rejected'}
                  </span>
                  <span style={{fontSize:11,color:'var(--green)',fontFamily:'Space Mono'}}>
                    +{v.vote==='confirm'?5:3} pts
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
