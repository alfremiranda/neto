import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange, signInWithGitHub, signInWithGoogle, signOut as sbSignOut } from '@/lib/supabase'
import { useFinanceStore } from '@/store/financeStore'

interface AuthState {
  user: User | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => () => void  // returns unsubscribe fn
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  initialize: () => {
    // Seed initial user (handles OAuth callback on page load)
    getUser().then(user => set({ user, loading: false }))

    // In prod: auto-pull on SIGNED_IN so a second device gets the latest data.
    // Safe now that every mutation auto-pushes — cloud is always up to date.
    const unsub = onAuthStateChange((user, event) => {
      set({ user, loading: false })
      if (event === 'SIGNED_IN' && user && !import.meta.env.DEV) {
        useFinanceStore.getState().syncFromCloud()
      }
    })
    return unsub
  },

  signInWithGitHub: async () => {
    await signInWithGitHub()
  },

  signInWithGoogle: async () => {
    await signInWithGoogle()
  },

  signOut: async () => {
    await sbSignOut()
    set({ user: null })
  },
}))
