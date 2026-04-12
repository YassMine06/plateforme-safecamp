import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Map, Bell, Users, Trophy, BarChart2, User, LogOut, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

const links = [
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { to: '/map',       icon: Map,       label: 'Live Map' },
  { to: '/alert',     icon: Bell,      label: 'New Alert' },
  { to: '/community', icon: Users,     label: 'Community' },
  { to: '/rewards',   icon: Trophy,    label: 'Rewards' },
  { to: '/profile',   icon: User,      label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('sc_theme') !== 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('sc_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Shield size={22} color="var(--accent)" />
        <span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>SafeCamp</span>
      </div>

      <div className="sidebar-id">
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>Your Anonymous ID</div>
        <div className="mono" style={{ fontSize: 13, color: 'var(--accent)', letterSpacing: 1 }}>
          {user?.anonymous_id}
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link-side ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', borderColor: 'var(--red)' }}
          onClick={() => { logout(); navigate('/login') }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}
