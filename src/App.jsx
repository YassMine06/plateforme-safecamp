import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import CreateAlert from './pages/CreateAlert'
import Community from './pages/Community'
import Rewards from './pages/Rewards'
import Profile from './pages/Profile'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login"/>
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar/>
      <main className="main-content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<Protected><Layout><Dashboard/></Layout></Protected>}/>
          <Route path="/map" element={<Protected><Layout><MapPage/></Layout></Protected>}/>
          <Route path="/alert" element={<Protected><Layout><CreateAlert/></Layout></Protected>}/>
          <Route path="/community" element={<Protected><Layout><Community/></Layout></Protected>}/>
          <Route path="/rewards" element={<Protected><Layout><Rewards/></Layout></Protected>}/>
          <Route path="/profile" element={<Protected><Layout><Profile/></Layout></Protected>}/>
          <Route path="*" element={<Navigate to="/login"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
