import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Trophy, Gift, CheckCircle, Star, X } from 'lucide-react'

const REWARDS = [
  { id:'coffee',   name:'Free Coffee',     icon:'☕', cost:15,  desc:'Specialty coffee at the library café', category:'Food' },
  { id:'meal',     name:'Cafeteria Meal',  icon:'🍽️', cost:30,  desc:'Full free meal at the campus cafeteria', category:'Food' },
  { id:'cinema',   name:'Cinema Ticket',   icon:'🎬', cost:50,  desc:'Free movie night at the campus cinema', category:'Entertainment' },
  { id:'book',     name:'Library Bonus',   icon:'📚', cost:25,  desc:'+7 days extra borrowing period', category:'Academic' },
  { id:'event',    name:'Event Access',    icon:'🎟️', cost:80,  desc:'VIP access to the next campus event', category:'Entertainment' },
  { id:'printing', name:'Print Credits',   icon:'🖨️', cost:20,  desc:'50 free pages at campus print stations', category:'Academic' },
  { id:'parking',  name:'Parking Pass',    icon:'🚗', cost:100, desc:'One month free campus parking', category:'Transport' },
  { id:'gym',      name:'Gym Day Pass',    icon:'💪', cost:35,  desc:'Free full-day access to the campus gym', category:'Wellness' },
]

const LEVEL_BADGES = [
  { label:'Beginner',  pts:0,   icon:'🌱' },
  { label:'Watcher',   pts:50,  icon:'👁' },
  { label:'Guardian',  pts:150, icon:'🛡️' },
  { label:'Sentinel',  pts:300, icon:'⚡' },
  { label:'Hero',      pts:500, icon:'🦸' },
]

export default function Rewards() {
  const { call } = useApi()
  const [points, setPoints] = useState(0)
  const [confirm, setConfirm] = useState(null)  // reward to confirm
  const [success, setSuccess] = useState(null)  // redeemed reward
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => { call('/profile').then(d => d && setPoints(d.points)) }, [])

  const redeem = async () => {
    if (!confirm) return
    setLoading(true); setErr('')
    const res = await call('/rewards/redeem', { method:'POST', body:{ reward:confirm.name, cost:confirm.cost } })
    setLoading(false)
    if (res?.message) {
      setSuccess(confirm)
      setPoints(p => p - confirm.cost)
      setConfirm(null)
    } else {
      setErr(res?.error||'Error')
      setConfirm(null)
    }
  }

  const categories = ['All', ...new Set(REWARDS.map(r => r.category))]
  const displayed = filter === 'All' ? REWARDS : REWARDS.filter(r => r.category === filter)

  const lvlIdx = LEVEL_BADGES.findLastIndex(l => points >= l.pts)
  const lvl = LEVEL_BADGES[Math.max(0, lvlIdx)]
  const nextLvl = LEVEL_BADGES[lvlIdx + 1]

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">🏆 Hero Rewards</div>
        <div className="page-sub">Spend your earned points on campus perks</div>
      </div>

      {/* Points hero card */}
      <div className="card" style={{marginBottom:24,background:'linear-gradient(135deg,rgba(0,212,255,.08),var(--card))',
        borderColor:'rgba(0,212,255,.25)'}}>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <Trophy size={42} color="var(--yellow)"/>
            <div>
              <div className="mono" style={{fontSize:36,fontWeight:700,color:'var(--accent)',lineHeight:1}}>{points}</div>
              <div style={{fontSize:13,color:'var(--text2)'}}>Available Points</div>
            </div>
          </div>

          <div style={{flex:1,minWidth:180}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
              <span style={{color:'var(--text2)'}}>Your level: <strong style={{color:'var(--yellow)'}}>{lvl?.icon} {lvl?.label}</strong></span>
              {nextLvl && <span style={{color:'var(--text2)'}}>{nextLvl.pts - points} pts to {nextLvl.label}</span>}
            </div>
            <div style={{height:6,background:'var(--bg2)',borderRadius:3}}>
              <div style={{height:'100%',borderRadius:3,background:'var(--yellow)',
                width:`${nextLvl ? Math.min(100,((points-lvl.pts)/(nextLvl.pts-lvl.pts))*100) : 100}%`,
                transition:'width 1s'}}/>
            </div>
          </div>

          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.8,padding:'8px 14px',background:'var(--bg2)',borderRadius:10}}>
            <div><span style={{color:'var(--accent)'}}>+10</span> Create alert</div>
            <div><span style={{color:'var(--green)'}}>+5</span>  Confirm alert</div>
            <div><span style={{color:'var(--yellow)'}}>+3</span>  Reject false alert</div>
          </div>
        </div>
      </div>

      {err && <div style={{padding:'10px 14px',background:'rgba(255,82,82,.1)',border:'1px solid rgba(255,82,82,.3)',
        borderRadius:8,color:'var(--red)',fontSize:13,marginBottom:16}}>{err}</div>}

      {success && (
        <div style={{padding:'12px 16px',background:'rgba(0,230,118,.1)',border:'1px solid rgba(0,230,118,.3)',
          borderRadius:10,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
          <CheckCircle size={20} color="var(--green)"/>
          <div>
            <div style={{fontWeight:600,color:'var(--green)'}}>Redeemed: {success.name}!</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{success.desc}</div>
          </div>
          <button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--text2)'}}
            onClick={() => setSuccess(null)}><X size={16}/></button>
        </div>
      )}

      {/* Category filter */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {categories.map(c => (
          <button key={c} className={`btn ${filter===c?'btn-primary':'btn-ghost'}`}
            style={{padding:'6px 14px',fontSize:12}} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid-3">
        {displayed.map(r => {
          const canAfford = points >= r.cost
          return (
            <div key={r.id} className="card" style={{display:'flex',flexDirection:'column',
              opacity:canAfford?1:0.55,transition:'opacity 0.3s',
              borderColor:canAfford?'var(--border)':'var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{fontSize:38}}>{r.icon}</div>
                <span style={{fontSize:11,padding:'3px 8px',background:'var(--bg2)',borderRadius:20,
                  color:'var(--text2)',fontWeight:500}}>{r.category}</span>
              </div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{r.name}</div>
              <div style={{fontSize:12,color:'var(--text2)',flex:1,marginBottom:14,lineHeight:1.5}}>{r.desc}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span className="mono" style={{fontWeight:700,fontSize:16,color:'var(--accent)'}}>{r.cost}</span>
                  <span style={{fontSize:11,color:'var(--text2)',marginLeft:3}}>pts</span>
                </div>
                <button className={`btn ${canAfford?'btn-primary':'btn-ghost'}`}
                  style={{padding:'7px 14px',fontSize:12,gap:6}}
                  onClick={() => canAfford && setConfirm(r)} disabled={!canAfford}>
                  <Gift size={13}/> {canAfford ? 'Redeem' : 'Need more pts'}
                </button>
              </div>
              {!canAfford && (
                <div style={{fontSize:11,color:'var(--text2)',marginTop:8,textAlign:'center'}}>
                  Need {r.cost - points} more pts
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',
          alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
          onClick={() => setConfirm(null)}>
          <div className="card animate-in" style={{width:'100%',maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:52,marginBottom:8}}>{confirm.icon}</div>
              <div style={{fontWeight:700,fontSize:18}}>{confirm.name}</div>
              <div style={{fontSize:13,color:'var(--text2)',marginTop:4}}>{confirm.desc}</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',
              background:'var(--bg2)',borderRadius:10,marginBottom:20}}>
              <span style={{color:'var(--text2)'}}>Cost</span>
              <span className="mono" style={{fontWeight:700,color:'var(--accent)'}}>{confirm.cost} pts</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',
              background:'var(--bg2)',borderRadius:10,marginBottom:20}}>
              <span style={{color:'var(--text2)'}}>Remaining after</span>
              <span className="mono" style={{fontWeight:700,color:points-confirm.cost>=0?'var(--green)':'var(--red)'}}>
                {points - confirm.cost} pts
              </span>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}}
                onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}}
                onClick={redeem} disabled={loading}>
                {loading ? 'Processing...' : <><CheckCircle size={14}/> Confirm Redeem</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
