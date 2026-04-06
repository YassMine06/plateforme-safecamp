import { useAuth } from '../context/AuthContext'

export function useApi() {
  const { token, logout } = useAuth()

  const call = async (path, options = {}) => {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })
    if (res.status === 401) { logout(); return null }
    return res.json()
  }

  return { call }
}
