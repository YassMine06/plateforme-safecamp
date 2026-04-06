import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { RefreshCw, Layers, X, MapPin } from 'lucide-react'

const LOCATIONS = [
  { id:'amp_a',    name:'Amphitheater A', x:110, y:90,  w:80, h:50, icon:'🎭' },
  { id:'amp_b',    name:'Amphitheater B', x:300, y:90,  w:80, h:50, icon:'🎭' },
  { id:'library',  name:'Library',        x:205, y:185, w:90, h:55, icon:'📚' },
  { id:'cafeteria',name:'Cafeteria',      x:80,  y:260, w:80, h:50, icon:'🍽️' },
  { id:'lab',      name:'Lab Block',      x:330, y:200, w:80, h:50, icon:'🔬' },
  { id:'cls_a',    name:'Classrooms A',   x:110, y:335, w:90, h:50, icon:'🏫' },
  { id:'cls_b',    name:'Classrooms B',   x:300, y:335, w:90, h:50, icon:'🏫' },
  { id:'entrance', name:'Main Entrance',  x:205, y:410, w:90, h:40, icon:'🚪' },
  { id:'parking',  name:'Parking',        x:385, y:330, w:65, h:45, icon:'🅿️' },
]

const ALERT_ICONS = { fire:'🔥', theft:'🚨', medical:'🏥', suspicious:'👁', vandalism:'🔨', other:'⚠️' }
const TYPE_COLOR  = { fire:'#ff6b35', theft:'#ff5252', medical:'#00e676', suspicious:'#ffd740', vandalism:'#ce93d8', other:'#8899b4' }

function riskColor(count) {
  if (count === 0) return { stroke:'#00e676', fill:'rgba(0,230,118,0.07)', text:'#00e676' }
  if (count === 1) return { stroke:'#ffd740', fill:'rgba(255,215,64,0.09)', text:'#ffd740' }
  if (count === 2) return { stroke:'#ff9800', fill:'rgba(255,152,0,0.11)', text:'#ff9800' }
  return { stroke:'#ff5252', fill:'rgba(255,82,82,0.13)', text:'#ff5252' }
}

export default function MapPage() {
  const { call } = useApi()
  const [alerts, setAlerts] = useState([])
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    const d = await call('/alerts')
    if (d) { setAlerts(d); setLastUpdate(new Date()) }
    setRefreshing(false)
  }

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv) }, [])

  const activeAlerts  = alerts.filter(a => a.status === 'active')
  const pendingAlerts = alerts.filter(a => a.status === 'pending')

  const riskMap = {}
  alerts.forEach(a => {
    if (a.status === 'rejected') return
    riskMap[a.location] = (riskMap[a.location] || 0) + (a.status === 'active' ? 2 : 1)
  })

  const alertsByLoc = {}
  alerts.filter(a => a.status !== 'rejected').forEach(a => {
    if (!alertsByLoc[a.location]) alertsByLoc[a.location] = []
    alertsByLoc[a.location].push(a)
  })

  const totalRisk = Object.values(riskMap).reduce((s, v) => s + v, 0)

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
        <div>
          <div className="page-title">🗺️ Live Campus Map</div>
          <div className="page-sub">
            Updated {lastUpdate.toLocaleTimeString()} ·{' '}
            <span style={{color:totalRisk===0?'var(--green)':totalRisk<4?'var(--yellow)':'var(--red)'}}>
              {totalRisk===0?'Campus Safe':totalRisk<4?'Low Risk':'High Activity'}
            </span>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" style={{padding:'8px 12px',fontSize:12,
            borderColor:showHeatmap?'var(--accent)':undefined,color:showHeatmap?'var(--accent)':undefined}}
            onClick={() => setShowHeatmap(h=>!h)}>
            <Layers size={14}/> Heatmap {showHeatmap?'ON':'OFF'}
          </button>
          <button className="btn btn-ghost" style={{padding:'8px 12px',fontSize:12}} onClick={load}>
            <RefreshCw size={14} style={{animation:refreshing?'spin 1s linear infinite':'none'}}/> Refresh
          </button>
        </div>
      </div>

      {/* Badges */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <span className="badge badge-red">🔴 {activeAlerts.length} Active</span>
        <span className="badge badge-yellow">🟡 {pendingAlerts.length} Pending</span>
        <span className="badge badge-green">🟢 {LOCATIONS.length-Object.keys(riskMap).length} Safe zones</span>
        <span className="badge badge-blue">📍 {alerts.filter(a=>a.status!=='rejected').length} Incidents</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:16}}>

        {/* ── SVG MAP ── */}
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <svg viewBox="0 0 450 465" style={{width:'100%',background:'var(--bg2)',display:'block'}}>
            <defs>
              {/* Per-location radial heatmap gradients */}
              {LOCATIONS.map(loc => {
                const risk = riskMap[loc.name] || 0
                const [c1,c2] = risk>=3 ? ['#ff5252','#ff525200']
                              : risk===2 ? ['#ff9800','#ff980000']
                              : risk===1 ? ['#ffd740','#ffd74000']
                              : ['#00e676','#00e67600']
                return (
                  <radialGradient key={loc.id} id={`rg-${loc.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor={c1} stopOpacity={risk===0?0.12:0.40}/>
                    <stop offset="55%"  stopColor={c1} stopOpacity={risk===0?0.05:0.15}/>
                    <stop offset="100%" stopColor={c2} stopOpacity={0}/>
                  </radialGradient>
                )
              })}
              {/* Global heatbar gradient */}
              <linearGradient id="heatbar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#00e676"/>
                <stop offset="40%"  stopColor="#ffd740"/>
                <stop offset="75%"  stopColor="#ff9800"/>
                <stop offset="100%" stopColor="#ff5252"/>
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Grid */}
            {[...Array(12)].map((_,i) => (
              <g key={i} opacity={0.15}>
                <line x1={i*40} y1={0} x2={i*40} y2={465} stroke="var(--border)" strokeWidth={0.6}/>
                <line x1={0} y1={i*40} x2={450} y2={i*40} stroke="var(--border)" strokeWidth={0.6}/>
              </g>
            ))}

            {/* Campus boundary */}
            <rect x={28} y={28} width={394} height={408} rx={14}
              fill="rgba(0,0,0,0.18)" stroke="var(--border)" strokeWidth={1.5} strokeDasharray="8 4"/>

            {/* Internal roads */}
            <line x1={225} y1={28} x2={225} y2={436} stroke="var(--border)" strokeWidth={1.5} opacity={0.4} strokeDasharray="5 4"/>
            <line x1={28} y1={225} x2={422} y2={225} stroke="var(--border)" strokeWidth={1.5} opacity={0.4} strokeDasharray="5 4"/>
            <line x1={150} y1={225} x2={150} y2={436} stroke="var(--border)" strokeWidth={1} opacity={0.25} strokeDasharray="3 4"/>
            {/* Entrance walkway */}
            <rect x={214} y={432} width={22} height={8} rx={2} fill="var(--border)" opacity={0.35}/>

            {/* ── HEATMAP ELLIPSES ── */}
            {showHeatmap && LOCATIONS.map(loc => {
              const risk = riskMap[loc.name] || 0
              const rx = loc.w * 0.85 + risk * 22
              const ry = loc.h * 0.85 + risk * 14
              return (
                <g key={`heat-${loc.id}`} style={{pointerEvents:'none'}}>
                  {/* Outer soft bloom */}
                  <ellipse cx={loc.x} cy={loc.y} rx={rx} ry={ry}
                    fill={`url(#rg-${loc.id})`}/>
                  {/* Inner concentrated spot for active risk */}
                  {risk >= 2 && (
                    <ellipse cx={loc.x} cy={loc.y} rx={rx*0.45} ry={ry*0.45}
                      fill={risk>=3?'#ff525230':'#ff980025'}/>
                  )}
                  {/* Animated pulse for danger zones */}
                  {risk >= 3 && (
                    <ellipse cx={loc.x} cy={loc.y} rx={rx*0.5} ry={ry*0.5}
                      fill="none" stroke="#ff5252" strokeWidth={1} opacity={0.4}>
                      <animate attributeName="rx" values={`${rx*0.4};${rx*0.7};${rx*0.4}`} dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="ry" values={`${ry*0.4};${ry*0.7};${ry*0.4}`} dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                  )}
                </g>
              )
            })}

            {/* ── BUILDINGS ── */}
            {LOCATIONS.map(loc => {
              const risk = riskMap[loc.name] || 0
              const col = riskColor(risk)
              const isHov = hover === loc.name
              const locAlerts = alertsByLoc[loc.name] || []
              return (
                <g key={loc.id}
                  style={{cursor:locAlerts.length>0?'pointer':'default'}}
                  onMouseEnter={() => setHover(loc.name)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => locAlerts.length>0 && setSelected(locAlerts[0])}>
                  {/* Shadow */}
                  <rect x={loc.x-loc.w/2+3} y={loc.y-loc.h/2+3} width={loc.w} height={loc.h}
                    rx={8} fill="rgba(0,0,0,0.28)"/>
                  {/* Body */}
                  <rect x={loc.x-loc.w/2} y={loc.y-loc.h/2} width={loc.w} height={loc.h}
                    rx={8} fill={col.fill} stroke={col.stroke} strokeWidth={isHov?2.5:1.5}
                    opacity={isHov?1:0.92}/>
                  {/* Roof accent line */}
                  <rect x={loc.x-loc.w/2} y={loc.y-loc.h/2} width={loc.w} height={4}
                    rx={8} fill={col.stroke} opacity={0.5}/>
                  {/* Emoji icon */}
                  <text x={loc.x} y={loc.y-2} textAnchor="middle" fontSize={15}>{loc.icon}</text>
                  {/* Label */}
                  <text x={loc.x} y={loc.y+14} textAnchor="middle"
                    fill={col.text} fontSize={8} fontFamily="DM Sans" fontWeight={700}>
                    {loc.name.replace('Amphitheater','Amph.').replace(' Block','')}
                  </text>
                  {/* Alert count badge */}
                  {locAlerts.length > 0 && (
                    <g filter={locAlerts.some(a=>a.status==='active')?'url(#glow)':undefined}>
                      <circle cx={loc.x+loc.w/2-7} cy={loc.y-loc.h/2+7} r={9}
                        fill={locAlerts.some(a=>a.status==='active')?'#ff5252':'#ffd740'}
                        stroke="var(--bg2)" strokeWidth={1.5}/>
                      <text x={loc.x+loc.w/2-7} y={loc.y-loc.h/2+11} textAnchor="middle"
                        fill="white" fontSize={8.5} fontWeight={700} fontFamily="DM Sans">
                        {locAlerts.length}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* ── ALERT PINS ── */}
            {alerts.filter(a=>a.status!=='rejected').map((alert, i) => {
              const loc = LOCATIONS.find(l=>l.name===alert.location)
              if (!loc) return null
              const locAlerts = alertsByLoc[alert.location] || []
              const idx = locAlerts.indexOf(alert)
              const cols = Math.min(locAlerts.length, 3)
              const ox = (idx % cols - (cols-1)/2) * 24
              const oy = Math.floor(idx / cols) * -26
              const px = loc.x + ox
              const py = loc.y - loc.h/2 - 20 + oy
              const isActive = alert.status === 'active'
              return (
                <g key={alert.id} filter={isActive?'url(#glow)':undefined}
                  style={{cursor:'pointer'}} onClick={e=>{e.stopPropagation();setSelected(alert)}}>
                  {isActive && (
                    <circle cx={px} cy={py} r={14} fill="none" stroke="#ff5252" strokeWidth={1.5} opacity={0.5}>
                      <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  <circle cx={px} cy={py} r={13}
                    fill={isActive?'rgba(255,82,82,0.6)':'rgba(255,215,64,0.55)'}
                    stroke={isActive?'#ff5252':'#ffd740'} strokeWidth={2}/>
                  <text x={px} y={py+5} textAnchor="middle" fontSize={13}>
                    {ALERT_ICONS[alert.type]||'⚠️'}
                  </text>
                </g>
              )
            })}

            {/* ── HEATMAP LEGEND BAR ── */}
            {showHeatmap && (
              <g transform="translate(30,438)">
                <rect width={170} height={22} rx={6} fill="var(--card)" opacity={0.88}/>
                <text x={8} y={9} fill="var(--text2)" fontSize={7} fontFamily="DM Sans" fontWeight={700} letterSpacing={1}>HEAT INTENSITY</text>
                <rect x={8} y={12} width={110} height={6} rx={3} fill="url(#heatbar)"/>
                <text x={8}   y={22} fill="#00e676" fontSize={7} fontFamily="DM Sans">Safe</text>
                <text x={118} y={22} fill="#ff5252" fontSize={7} fontFamily="DM Sans" textAnchor="end">Danger</text>
              </g>
            )}

            {/* ── STATUS LEGEND ── */}
            <g transform="translate(300,438)">
              <rect width={122} height={22} rx={6} fill="var(--card)" opacity={0.88}/>
              <circle cx={12} cy={11} r={5} fill="#ff5252"/>
              <text x={21} y={15} fill="var(--text2)" fontSize={8} fontFamily="DM Sans">Active</text>
              <circle cx={60} cy={11} r={5} fill="#ffd740"/>
              <text x={69} y={15} fill="var(--text2)" fontSize={8} fontFamily="DM Sans">Pending</text>
            </g>
          </svg>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>

          {/* Zone risk summary */}
          <div className="card" style={{padding:'14px 16px'}}>
            <div style={{fontSize:11,color:'var(--text2)',fontWeight:700,letterSpacing:1,marginBottom:10}}>📊 RISK BY ZONE</div>
            {LOCATIONS.filter(l=>riskMap[l.name]).sort((a,b)=>(riskMap[b.name]||0)-(riskMap[a.name]||0)).map(loc => {
              const risk = riskMap[loc.name]||0
              const col = risk>=4?'#ff5252':risk>=2?'#ff9800':'#ffd740'
              return (
                <div key={loc.id} style={{marginBottom:9}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span>{loc.icon} {loc.name}</span>
                    <span style={{color:col,fontWeight:700,fontFamily:'Space Mono',fontSize:10}}>
                      {'▲'.repeat(Math.min(risk,3))} {risk}
                    </span>
                  </div>
                  <div style={{height:3,background:'var(--bg2)',borderRadius:2}}>
                    <div style={{height:'100%',borderRadius:2,background:col,width:`${Math.min(100,(risk/6)*100)}%`,transition:'width 1s'}}/>
                  </div>
                </div>
              )
            })}
            {!Object.keys(riskMap).length && <div style={{fontSize:12,color:'var(--green)'}}>✅ All zones clear</div>}
          </div>

          {/* Active */}
          <div className="card" style={{flex:1}}>
            <div style={{fontWeight:600,marginBottom:10,fontSize:13,display:'flex',justifyContent:'space-between'}}>
              <span>🚨 Active</span>
              <span className="badge badge-red">{activeAlerts.length}</span>
            </div>
            {activeAlerts.length===0 && <div style={{color:'var(--text2)',fontSize:12}}>Campus clear ✅</div>}
            {activeAlerts.map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                style={{padding:'8px 10px',background:'var(--bg2)',borderRadius:8,marginBottom:6,
                  cursor:'pointer',border:'1px solid rgba(255,82,82,.25)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13}}>{ALERT_ICONS[a.type]} <strong>{a.type}</strong></span>
                  <span style={{width:7,height:7,borderRadius:'50%',background:'var(--red)',display:'inline-block',animation:'pulse 1.5s infinite'}}/>
                </div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>📍 {a.location}</div>
                <div style={{fontSize:11,color:'var(--green)',marginTop:2}}>✓ {a.confirmations} confirmations</div>
              </div>
            ))}
          </div>

          {/* Pending */}
          <div className="card">
            <div style={{fontWeight:600,marginBottom:10,fontSize:13,display:'flex',justifyContent:'space-between'}}>
              <span>⏳ Pending</span>
              <span className="badge badge-yellow">{pendingAlerts.length}</span>
            </div>
            {pendingAlerts.length===0 && <div style={{color:'var(--text2)',fontSize:12}}>Nothing pending</div>}
            {pendingAlerts.slice(0,4).map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                style={{padding:'8px 10px',background:'var(--bg2)',borderRadius:8,marginBottom:6,
                  cursor:'pointer',border:'1px solid rgba(255,215,64,.2)'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:12}}>{ALERT_ICONS[a.type]} {a.type}</span>
                  <span style={{fontSize:11,color:'var(--yellow)',fontFamily:'Space Mono'}}>{a.confirmations}/3</span>
                </div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>📍 {a.location}</div>
                <div style={{height:2,background:'var(--border)',borderRadius:1,marginTop:5}}>
                  <div style={{height:'100%',background:'var(--yellow)',borderRadius:1,width:`${(a.confirmations/3)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',
          alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
          onClick={() => setSelected(null)}>
          <div className="card animate-in" style={{width:'100%',maxWidth:400,position:'relative'}}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)}
              style={{position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',color:'var(--text2)'}}>
              <X size={18}/>
            </button>
            <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:16}}>
              <div style={{width:52,height:52,borderRadius:12,flexShrink:0,
                background:`${(TYPE_COLOR[selected.type]||'#8899b4')}22`,
                border:`1px solid ${TYPE_COLOR[selected.type]||'#8899b4'}`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>
                {ALERT_ICONS[selected.type]||'⚠️'}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:17}}>{selected.type?.toUpperCase()} ALERT</div>
                <div style={{color:'var(--text2)',fontSize:13,display:'flex',alignItems:'center',gap:4,marginTop:4}}>
                  <MapPin size={12}/> {selected.location}
                </div>
              </div>
            </div>
            {selected.description && (
              <div style={{fontSize:13,marginBottom:14,padding:'10px 14px',background:'var(--bg2)',borderRadius:8,
                color:'var(--text2)',fontStyle:'italic',borderLeft:`3px solid ${TYPE_COLOR[selected.type]||'#8899b4'}`}}>
                "{selected.description}"
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              <div style={{padding:10,background:'var(--bg2)',borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:700,fontFamily:'Space Mono',
                  color:selected.status==='active'?'var(--red)':'var(--yellow)'}}>
                  {selected.status?.toUpperCase()}
                </div>
                <div style={{fontSize:11,color:'var(--text2)'}}>Status</div>
              </div>
              <div style={{padding:10,background:'var(--bg2)',borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:700,fontFamily:'Space Mono',color:'var(--green)'}}>{selected.confirmations}/3</div>
                <div style={{fontSize:11,color:'var(--text2)'}}>Confirmations</div>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text2)',marginBottom:4}}>
                <span>Validation progress</span><span>{selected.rejections} rejections</span>
              </div>
              <div style={{height:5,background:'var(--bg2)',borderRadius:3}}>
                <div style={{height:'100%',borderRadius:3,background:'var(--green)',
                  width:`${Math.min(100,(selected.confirmations/3)*100)}%`,transition:'width 0.5s'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href="/community" className="btn btn-primary" style={{flex:1,justifyContent:'center',textDecoration:'none',fontSize:13}}>
                Vote Now
              </a>
              <button className="btn btn-ghost" style={{flex:1,justifyContent:'center',fontSize:13}}
                onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
