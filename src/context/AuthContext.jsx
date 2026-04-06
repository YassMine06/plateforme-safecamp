import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Check session first, then local storage
  const getStored = (key) => sessionStorage.getItem(key) || localStorage.getItem(key)

  const [token, setToken] = useState(() => getStored('sc_token'))
  const [user, setUser] = useState(() => {
    const id = getStored('sc_id')
    return id ? { anonymous_id: id } : null
  })

  // We can remove the old useEffect that asynchronously set the user,
  // since user is now populated synchronously on the first render frame.

  const login = (tok, id, remember = false) => {
    setToken(tok)
    setUser({ anonymous_id: id })
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('sc_token', tok)
    storage.setItem('sc_id', id)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('sc_token')
    localStorage.removeItem('sc_id')
    sessionStorage.removeItem('sc_token')
    sessionStorage.removeItem('sc_id')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
