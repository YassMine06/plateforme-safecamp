import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Map, Bell, Users, User } from 'lucide-react'

const LINKS = [
  { to: '/dashboard', icon: BarChart2, label: 'Stats' },
  { to: '/map',       icon: Map,       label: 'Carte' },
  { to: '/alert',     icon: Bell,      label: 'Alerte', fab: true },
  { to: '/community', icon: Users,     label: 'Comm.' },
  { to: '/profile',   icon: User,      label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navigation principale">
      {LINKS.map(({ to, icon: Icon, label, fab }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `nav-item${fab ? ' nav-fab' : ''}${isActive ? ' active' : ''}`
          }
        >
          {fab ? (
            <>
              <div className="nav-fab-inner">
                <Icon size={22} strokeWidth={2.5} />
              </div>
              <span className="nav-label" style={{ color: 'var(--text2)' }}>{label}</span>
            </>
          ) : (
            <>
              <Icon size={22} strokeWidth={2} />
              <span className="nav-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
