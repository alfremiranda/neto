import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange, signInWithGitHub, signInWithGoogle, signOut as sbSignOut } from '@/lib/supabase'
import { useFinanceStore } from '@/store/financeStore'

interface AuthState {
  user: User | null
  loading: boolean
  cloudReady: boolean  // true once initial cloud sync resolves (prevents onboarding flash for returning users)
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => () => void  // returns unsubscribe fn
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  cloudReady: false,

  initialize: () => {
    // Seed initial user (handles OAuth callback on page load)
    getUser().then(user => {
      set({ user, loading: false })
      // No session → no sync needed, mark ready immediately
      if (!user) set({ cloudReady: true })
    })

    // In prod: auto-pull on SIGNED_IN so a second device gets the latest data.
    // cloudReady is set only after sync completes to avoid showing onboarding
    // briefly for returning users whose _settings.onboardingDone is in the cloud.
    const unsub = onAuthStateChange((user, event) => {
      if (event === 'SIGNED_IN' && user && !import.meta.env.DEV) {
        set({ user, loading: false })
        useFinanceStore.getState().syncFromCloud().finally(() => {
          set({ cloudReady: true })
        })
      } else {
        set({ user, loading: false, cloudReady: true })
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
