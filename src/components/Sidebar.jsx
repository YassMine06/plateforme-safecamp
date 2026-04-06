import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Map, Bell, Users, Trophy, BarChart2, User, LogOut, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

const links = [
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Live Map' },
  { to: '/alert', icon: Bell, label: 'New Alert' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/rewards', icon: Trophy, label: 'Rewards' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(!open)}>
          <span/><span/><span/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Shield size={20} color="var(--accent)"/>
          <span style={{fontFamily:'Space Mono',fontWeight:700,fontSize:14}}>SafeCamp</span>
        </div>
        <span className="mono" style={{fontSize:12,color:'var(--text2)'}}>{user?.anonymous_id}</span>
      </div>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}/>}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Shield size={22} color="var(--accent)"/>
          <span className="mono" style={{fontSize:15,fontWeight:700}}>SafeCamp</span>
        </div>

        <div className="sidebar-id">
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>Your Anonymous ID</div>
          <div className="mono" style={{fontSize:13,color:'var(--accent)',letterSpacing:1}}>{user?.anonymous_id}</div>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={18}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginBottom:8}} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',color:'var(--red)',borderColor:'var(--red)'}}
            onClick={() => { logout(); navigate('/login') }}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed; top: 0; left: 0; width: var(--sidebar); height: 100vh;
          background: var(--card); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 20px 16px; z-index: 100;
          transition: transform 0.3s;
        }
        .sidebar-brand { display:flex; align-items:center; gap:10px; padding-bottom:20px; border-bottom:1px solid var(--border); margin-bottom:16px; }
        .sidebar-id { padding:10px 12px; background:var(--bg2); border-radius:8px; margin-bottom:20px; }
        .sidebar-nav { flex:1; display:flex; flex-direction:column; gap:4px; }
        .nav-link { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; color:var(--text2); text-decoration:none; font-size:14px; font-weight:500; transition:all 0.2s; }
        .nav-link:hover { background:var(--bg2); color:var(--text); }
        .nav-link.active { background:rgba(0,212,255,.1); color:var(--accent); border-left:3px solid var(--accent); }
        .sidebar-bottom { padding-top:16px; border-top:1px solid var(--border); }
        .mobile-bar { display:none; position:fixed; top:0; left:0; right:0; height:56px; background:var(--card); border-bottom:1px solid var(--border); z-index:200; padding:0 16px; align-items:center; justify-content:space-between; }
        .hamburger { background:none; border:none; cursor:pointer; display:flex; flex-direction:column; gap:5px; padding:4px; }
        .hamburger span { display:block; width:22px; height:2px; background:var(--text); border-radius:2px; }
        .sidebar-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99; }
        @media (max-width:768px) {
          .sidebar { transform:translateX(-100%); }
          .sidebar.open { transform:translateX(0); }
          .mobile-bar { display:flex; }
          .main-content { margin-left:0 !important; padding-top:72px !important; }
        }
      `}</style>
    </>
  )
}
