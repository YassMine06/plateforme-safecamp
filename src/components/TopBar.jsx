import { useLocation, useNavigate } from 'react-router-dom'
import { Shield, Sun, Moon, LogOut, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': '📊 Dashboard',
  '/map':       '🗺️ Carte Live',
  '/alert':     '🚨 Nouvelle Alerte',
  '/community': '🤝 Communauté',
  '/rewards':   '🏆 Récompenses',
  '/profile':   '👤 Mon Profil',
}

export default function TopBar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(() => localStorage.getItem('sc_theme') !== 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('sc_theme', dark ? 'dark' : 'light')
  }, [dark])

  const title = PAGE_TITLES[location.pathname] || 'SafeCamp'

  return (
    <header className="top-bar">
      {/* Brand */}
      <div className="top-bar-brand">
        <Shield size={20} color="var(--accent)" />
        <span
          className="mono"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          SafeCamp
        </span>
      </div>

      {/* Page title — centré */}
      <span style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        maxWidth: 160,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {title}
      </span>

      {/* Actions */}
      <div className="top-bar-actions">
        {/* Rewards shortcut */}
        <button
          className="icon-btn"
          onClick={() => navigate('/rewards')}
          title="Récompenses"
          aria-label="Récompenses"
        >
          <Trophy size={17} />
        </button>

        {/* Theme toggle */}
        <button
          className="icon-btn"
          onClick={() => setDark(!dark)}
          title="Changer thème"
          aria-label="Changer thème"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Logout */}
        <button
          className="icon-btn"
          style={{ borderColor: 'rgba(255,82,82,0.3)', color: 'var(--red)' }}
          onClick={() => { logout(); navigate('/login') }}
          title="Déconnexion"
          aria-label="Déconnexion"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
