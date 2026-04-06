import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { ThumbsUp, ThumbsDown, Users, Zap, Info } from 'lucide-react'

const ALERT_ICONS = { fire:'🔥', theft:'🚨', medical:'🏥', suspicious:'👁', vandalism:'🔨', other:'⚠️' }
const TYPE_COLOR  = { fire:'#ff6b35', theft:'#ff5252', medical:'#00e676', suspicious:'#ffd740', vandalism:'#ce93d8', other:'#8899b4' }

const timeAgo = ts => {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export default function Community() {
  const { call } = useApi()
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [voted, setVoted] = useState({})   // alertId → 'confirm'|'reject'|error string
  const [loading, setLoading] = useState({})
  const [filter, setFilter] = useState('all') // all | mine

  const load = () => call('/alerts?status=pending').then(d => d && setAlerts(d))
  useEffect(() => { load() }, [])

  const vote = async (id, v) => {
    setLoading(p => ({...p,[id]:true}))
    const res = await call(`/alerts/${id}/vote`, { method:'POST', body:{ vote:v } })
    setLoading(p => ({...p,[id]:false}))
    if (res?.message) {
      setVoted(p => ({...p,[id]:v}))
      load()
    } else {
      setVoted(p => ({...p,[id]:res?.error||'Error voting'}))
    }
  }

  const displayed = filter === 'mine'
    ? alerts.filter(a => a.created_by === user?.anonymous_id)
    : alerts

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">🤝 Community Validation</div>
        <div className="page-sub">Help the campus verify incidents — anonymous & trustworthy</div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <div className="card" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px'}}>
          <Users size={18} color="var(--accent)"/>
          <div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:'Space Mono'}}>{alerts.length}</div>
            <div style={{fontSize:11,color:'var(--text2)'}}>Need votes</div>
          </div>
        </div>
        <div className="card" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px'}}>
          <Zap size={18} color="var(--yellow)"/>
          <div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:1}}>Point rewards</div>
            <div style={{fontSize:12}}><span style={{color:'var(--green)'}}>+5 confirm</span> · <span style={{color:'var(--yellow)'}}>+3 reject</span></div>
          </div>
        </div>
        <div className="card" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px'}}>
          <Info size={18} color="var(--text2)"/>
          <div>
            <div style={{fontSize:11,color:'var(--text2)'}}>Rules</div>
            <div style={{fontSize:11}}><span style={{color:'var(--green)'}}>3 ✓ → active</span> · <span style={{color:'var(--red)'}}>5 ✗ → discard</span></div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {['all','mine'].map(f => (
          <button key={f} className={`btn ${filter===f?'btn-primary':'btn-ghost'}`}
            style={{padding:'7px 16px',fontSize:12}} onClick={() => setFilter(f)}>
            {f==='all' ? `All (${alerts.length})` : `My Alerts (${alerts.filter(a=>a.created_by===user?.anonymous_id).length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="card" style={{textAlign:'center',padding:'48px 20px'}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <div style={{fontWeight:600,fontSize:16,marginBottom:6}}>All caught up!</div>
          <div style={{color:'var(--text2)',fontSize:13}}>
            {filter==='mine' ? "You haven't created any pending alerts." : "No pending alerts right now."}
          </div>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {displayed.map(a => {
          const myVote = voted[a.id]
          const isOwn  = a.created_by === user?.anonymous_id
          const confirmPct = (a.confirmations / 3) * 100
          const rejectPct  = (a.rejections  / 5) * 100
          const typeCol = TYPE_COLOR[a.type] || '#8899b4'
          return (
            <div key={a.id} className="card" style={{borderLeft:`3px solid ${typeCol}`}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                {/* Icon */}
                <div style={{width:48,height:48,borderRadius:10,flexShrink:0,
                  background:`${typeCol}18`,border:`1px solid ${typeCol}40`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                  {ALERT_ICONS[a.type]||'⚠️'}
                </div>

                <div style={{flex:1,minWidth:0}}>
                  {/* Title row */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6,marginBottom:4}}>
                    <div>
                      <span style={{fontWeight:700,fontSize:15,color:typeCol}}>{a.type?.toUpperCase()}</span>
                      <span style={{color:'var(--text2)',fontSize:13,marginLeft:8}}>@ {a.location}</span>
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {isOwn && <span className="badge badge-blue">Your alert</span>}
                      <span style={{fontSize:11,color:'var(--text2)'}}>{timeAgo(a.created_at)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {a.description && (
                    <div style={{fontSize:13,color:'var(--text2)',marginBottom:10,
                      padding:'6px 10px',background:'var(--bg2)',borderRadius:6,fontStyle:'italic'}}>
                      "{a.description}"
                    </div>
                  )}

                  {/* Progress bars */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:'flex',gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text2)',marginBottom:3}}>
                          <span>Confirmations</span><span style={{color:'var(--green)'}}>{a.confirmations}/3</span>
                        </div>
                        <div style={{height:5,background:'var(--bg2)',borderRadius:3}}>
                          <div style={{height:'100%',borderRadius:3,background:'var(--green)',
                            width:`${Math.min(100,confirmPct)}%`,transition:'width 0.5s'}}/>
                        </div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text2)',marginBottom:3}}>
                          <span>Rejections</span><span style={{color:'var(--red)'}}>{a.rejections}/5</span>
                        </div>
                        <div style={{height:5,background:'var(--bg2)',borderRadius:3}}>
                          <div style={{height:'100%',borderRadius:3,background:'var(--red)',
                            width:`${Math.min(100,rejectPct)}%`,transition:'width 0.5s'}}/>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vote buttons / result */}
                  {isOwn ? (
                    <div style={{fontSize:12,color:'var(--text2)',display:'flex',alignItems:'center',gap:6,
                      padding:'6px 10px',background:'var(--bg2)',borderRadius:6}}>
                      ℹ️ You cannot vote on your own alert
                    </div>
                  ) : myVote ? (
                    <div style={{fontSize:13,padding:'8px 12px',borderRadius:8,
                      background: myVote==='confirm'?'rgba(0,230,118,.08)':myVote==='reject'?'rgba(255,82,82,.08)':'rgba(255,82,82,.08)',
                      border:`1px solid ${myVote==='confirm'?'var(--green)':myVote==='reject'?'var(--red)':'var(--red)'}`,
                      color: myVote==='confirm'?'var(--green)':myVote==='reject'?'var(--red)':'var(--red)'}}>
                      {myVote === 'confirm' ? '✅ You confirmed this alert (+5 pts)'
                       : myVote === 'reject' ? '❌ You rejected this alert (+3 pts)'
                       : `⚠️ ${myVote}`}
                    </div>
                  ) : (
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-success" style={{fontSize:13,padding:'8px 18px'}}
                        onClick={() => vote(a.id,'confirm')} disabled={!!loading[a.id]}>
                        <ThumbsUp size={14}/> Confirm
                      </button>
                      <button className="btn btn-danger" style={{fontSize:13,padding:'8px 18px'}}
                        onClick={() => vote(a.id,'reject')} disabled={!!loading[a.id]}>
                        <ThumbsDown size={14}/> Reject
                      </button>
                      {loading[a.id] && <span style={{fontSize:12,color:'var(--text2)',alignSelf:'center'}}>Processing...</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
