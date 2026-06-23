import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let _sb: SupabaseClient | null = null

function sbClient(): SupabaseClient {
  if (!_sb) {
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _sb
}

export function sbReady(): boolean { return true }

// ─── Auth ────────────────────────────────────────────────────────────────────

const REDIRECT_URL = `${window.location.origin}/neto/`

export async function signInWithGitHub(): Promise<void> {
  await sbClient().auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: REDIRECT_URL },
  })
}

export async function signInWithGoogle(): Promise<void> {
  await sbClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: REDIRECT_URL },
  })
}

export async function signOut(): Promise<void> {
  await sbClient().auth.signOut()
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await sbClient().auth.getUser()
  return user
}

export function onAuthStateChange(cb: (user: User | null) => void) {
  const { data: { subscription } } = sbClient().auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

// ─── Data sync ───────────────────────────────────────────────────────────────

export async function sbPush(key: string, data: unknown): Promise<void> {
  const sb = sbClient()
  const user = await getUser()
  if (!user) return

  if (data === null) {
    await sb.from('months').delete().eq('key', key).eq('user_id', user.id)
    return
  }

  await sb.from('months').upsert(
    { user_id: user.id, key, data, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,key' },
  )
}

export async function sbDeleteAll(): Promise<void> {
  const sb = sbClient()
  const user = await getUser()
  if (!user) return
  await sb.from('months').delete().eq('user_id', user.id)
}

export async function sbPullAll(): Promise<Array<{ key: string; data: unknown }> | null> {
  const sb = sbClient()
  const user = await getUser()
  if (!user) return null

  const { data, error } = await sb
    .from('months')
    .select('key, data')
    .eq('user_id', user.id)

  return error ? null : data
}
