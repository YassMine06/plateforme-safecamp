import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Shield, AlertTriangle, Clock, XCircle, TrendingUp, Activity } from 'lucide-react'

const TYPE_COLORS = { theft:'#ff5252', fire:'#ff6b35', medical:'#00e676', suspicious:'#ffd740', vandalism:'#ce93d8', other:'#8899b4' }
const PIE_COLORS  = ['#ff5252','#ffd740','#8899b4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:12}}>
      <div style={{color:'var(--text2)',marginBottom:4}}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{color:p.color||'var(--accent)',fontWeight:600}}>{p.value} alerts</div>)}
    </div>
  )
}

export default function Dashboard() {
  const { call } = useApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    call('/analytics').then(d => { if (d) setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:'var(--text2)'}}>
      <Activity size={20} style={{marginRight:8,animation:'pulse 1s infinite'}}/> Loading analytics...
    </div>
  )

  if (!data) return <div style={{color:'var(--red)',padding:20}}>Failed to load data.</div>

  const stats = [
    { label:'Total Alerts',  value:data.total,    icon:Shield,        color:'var(--accent)',  bg:'rgba(0,212,255,.1)' },
    { label:'Active',        value:data.active,   icon:AlertTriangle, color:'var(--red)',     bg:'rgba(255,82,82,.1)' },
    { label:'Pending',       value:data.pending,  icon:Clock,         color:'var(--yellow)',  bg:'rgba(255,215,64,.1)' },
    { label:'Rejected',      value:data.rejected, icon:XCircle,       color:'var(--text2)',   bg:'rgba(136,153,180,.1)' },
  ]

  const pieData = [
    { name:'Active',   value: data.active  || 0 },
    { name:'Pending',  value: data.pending || 0 },
    { name:'Rejected', value: data.rejected|| 0 },
  ].filter(d => d.value > 0)

  // Enrich bar chart with type colors
  const barData = (data.by_type || []).map(d => ({ ...d, fill: TYPE_COLORS[d.type] || '#8899b4' }))

  // Format trend dates
  const trendData = (data.trend || []).map(d => ({ ...d, day: d.day?.slice(5) || d.day }))

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">📊 Analytics Dashboard</div>
        <div className="page-sub">Campus security overview — live data</div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{marginBottom:24}}>
        {stats.map(s => (
          <div className="card" key={s.label} style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:46,height:46,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <s.icon size={22} color={s.color}/>
            </div>
            <div>
              <div style={{fontSize:28,fontWeight:700,fontFamily:'Space Mono',lineHeight:1,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        {/* Bar chart */}
        <div className="card">
          <div style={{fontWeight:600,marginBottom:4}}>Alerts by Type</div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>Incident breakdown</div>
          {barData.length === 0
            ? <div style={{color:'var(--text2)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No data yet — create some alerts!</div>
            : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={barData} barCategoryGap="30%">
                  <XAxis dataKey="type" tick={{fill:'var(--text2)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fill:'var(--text2)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" radius={[5,5,0,0]}>
                    {barData.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Pie chart */}
        <div className="card">
          <div style={{fontWeight:600,marginBottom:4}}>Status Distribution</div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>Active vs Pending vs Rejected</div>
          {pieData.length === 0
            ? <div style={{color:'var(--text2)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No alerts to display</div>
            : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" outerRadius={78} innerRadius={38}
                    dataKey="value" paddingAngle={3}
                    label={({name,percent}) => percent>0.05?`${name} ${(percent*100).toFixed(0)}%`:''}>
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,color:'var(--text2)'}}/>
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      <div className="grid-2">
        {/* Trend line */}
        <div className="card">
          <div style={{fontWeight:600,marginBottom:4}}>7-Day Activity Trend</div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>Alerts reported per day</div>
          {trendData.length === 0
            ? <div style={{color:'var(--text2)',fontSize:13,padding:'20px 0',textAlign:'center'}}>Not enough data yet</div>
            : (
              <ResponsiveContainer width="100%" height={175}>
                <LineChart data={trendData}>
                  <XAxis dataKey="day" tick={{fill:'var(--text2)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fill:'var(--text2)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5}
                    dot={{fill:'var(--accent)',r:4,strokeWidth:0}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Risk locations */}
        <div className="card">
          <div style={{fontWeight:600,marginBottom:4}}>🔥 Riskiest Locations</div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>Most reported zones</div>
          {(data.by_location||[]).length === 0
            ? <div style={{color:'var(--text2)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No location data yet</div>
            : (data.by_location||[]).map((loc,i) => {
              const col = i===0?'var(--red)':i===1?'#ff9800':'var(--yellow)'
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:26,height:26,borderRadius:8,background:'var(--bg2)',display:'flex',
                    alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,
                    color:col,fontFamily:'Space Mono',flexShrink:0}}>
                    {i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{loc.location}</div>
                    <div style={{height:4,background:'var(--bg2)',borderRadius:2}}>
                      <div style={{height:'100%',borderRadius:2,background:col,
                        width:`${Math.min(100,(loc.count/(data.total||1))*100+15)}%`,transition:'width 1s'}}/>
                    </div>
                  </div>
                  <span className="badge" style={{background:`${col}22`,color:col,flexShrink:0}}>{loc.count}</span>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}
