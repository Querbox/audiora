import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from './lib/supabase.js'

const AuthContext = createContext({ user: null, profile: null, loading: false })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user) { setProfile(null); return }
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [user])

  const value = {
    user,
    profile,
    loading,
    isConfigured,
    signUp: (email, password, username) =>
      supabase.auth.signUp({ email, password, options: { data: { username } } }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// Zustand eines Nutzers zu einem Audio-Objekt (Favorit / Gehört / Geliked)
export function useUserItem(itemId) {
  const { user } = useAuth()
  const [state, setState] = useState({ fav: false, heard: false, liked: false })

  useEffect(() => {
    let active = true
    setState({ fav: false, heard: false, liked: false })
    if (!supabase || !user || !itemId) return
    supabase
      .from('user_items')
      .select('fav, heard, liked')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .maybeSingle()
      .then(({ data }) => { if (active && data) setState(data) })
    return () => { active = false }
  }, [user, itemId])

  const toggle = async (field) => {
    const next = { ...state, [field]: !state[field] }
    setState(next) // optimistisch
    if (supabase && user) {
      await supabase.from('user_items').upsert({
        user_id: user.id,
        item_id: itemId,
        ...next,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return [state, toggle]
}

// Alle markierten Titel des Nutzers (für Audio-DNA & Profil)
export function useUserLibrary() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (!supabase || !user) { setRows(null); return }
    supabase
      .from('user_items')
      .select('item_id, fav, heard, liked, updated_at')
      .eq('user_id', user.id)
      .then(({ data }) => setRows(data || []))
  }, [user])

  return rows
}
