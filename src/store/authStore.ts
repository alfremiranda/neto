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

    // Subscribe to session changes — auto-pull on SIGNED_IN (login + session restore)
    const unsub = onAuthStateChange((user, event) => {
      set({ user, loading: false })
      if (event === 'SIGNED_IN' && user) {
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
