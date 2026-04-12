import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Shield, AlertTriangle, Clock, XCircle, Activity } from 'lucide-react'

const TYPE_COLORS = {
  theft: '#ff5252', fire: '#ff6b35', medical: '#00e676',
  suspicious: '#ffd740', vandalism: '#ce93d8', other: '#8899b4'
}
const PIE_COLORS = ['#ff5252', '#ffd740', '#8899b4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12
    }}>
      <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--accent)', fontWeight: 600 }}>
          {p.value} alertes
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { call } = useApi()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    call('/analytics').then(d => { if (d) setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="empty-state" style={{ paddingTop: 60 }}>
      <Activity size={32} color="var(--accent)" style={{ animation: 'pulse 1s infinite', marginBottom: 12 }} />
      <div className="empty-state-sub">Chargement des données…</div>
    </div>
  )

  if (!data) return (
    <div style={{ color: 'var(--red)', padding: 20, textAlign: 'center' }}>
      Impossible de charger les données.
    </div>
  )

  const stats = [
    { label: 'Total',    value: data.total,    icon: Shield,        color: 'var(--accent)',  bg: 'rgba(0,212,255,.12)' },
    { label: 'Actives',  value: data.active,   icon: AlertTriangle, color: 'var(--red)',     bg: 'rgba(255,82,82,.12)' },
    { label: 'En attente', value: data.pending,  icon: Clock,         color: 'var(--yellow)',  bg: 'rgba(255,215,64,.12)' },
    { label: 'Rejetées', value: data.rejected, icon: XCircle,       color: 'var(--text2)',   bg: 'rgba(136,153,180,.12)' },
  ]

  const pieData = [
    { name: 'Actives',   value: data.active   || 0 },
    { name: 'Attente',   value: data.pending  || 0 },
    { name: 'Rejetées',  value: data.rejected || 0 },
  ].filter(d => d.value > 0)

  const barData  = (data.by_type || []).map(d => ({ ...d, fill: TYPE_COLORS[d.type] || '#8899b4' }))
  const trendData = (data.trend  || []).map(d => ({ ...d, day: d.day?.slice(5) || d.day }))

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Tableau de bord</div>
        <div className="page-sub">Sécurité campus · données en direct</div>
      </div>

      {/* ── Stat cards 2×2 ── */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {stats.map(s => (
          <div className="card stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Alerts by type ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 14 }}>Alertes par type</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Répartition par catégorie</div>
        {barData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-sub">Pas encore d'alertes — créez-en une !</div>
          </div>
        ) : (
          <div className="chart-scroll">
            <ResponsiveContainer width="100%" height={180} minWidth={280}>
              <BarChart data={barData} barCategoryGap="30%">
                <XAxis dataKey="type" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Status pie ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 14 }}>Distribution des statuts</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Actives · Attente · Rejetées</div>
        {pieData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🥧</div>
            <div className="empty-state-sub">Pas d'alertes à afficher</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" outerRadius={72} innerRadius={36}
                dataKey="value" paddingAngle={3}
                label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 7-day trend ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 14 }}>Tendance 7 jours</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Alertes signalées par jour</div>
        {trendData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <div className="empty-state-sub">Pas encore assez de données</div>
          </div>
        ) : (
          <div className="chart-scroll">
            <ResponsiveContainer width="100%" height={160} minWidth={260}>
              <LineChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5}
                  dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Riskiest locations ── */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 14 }}>🔥 Zones à risque</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>Lieux les plus signalés</div>
        {(data.by_location || []).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <div className="empty-state-sub">Pas encore de données de localisation</div>
          </div>
        ) : (
          (data.by_location || []).map((loc, i) => {
            const col = i === 0 ? 'var(--red)' : i === 1 ? '#ff9800' : 'var(--yellow)'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: 'var(--bg2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: col, fontFamily: 'Space Mono', flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {loc.location}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      background: col,
                      width: `${Math.min(100, (loc.count / (data.total || 1)) * 100 + 15)}%`
                    }} />
                  </div>
                </div>
                <span className="badge" style={{ background: `${col}22`, color: col, flexShrink: 0 }}>
                  {loc.count}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
