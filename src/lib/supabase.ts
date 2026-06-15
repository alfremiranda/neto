import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://fhpskefipslrgwkfzmng.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_PDdqSQoohDfQHqYnGa-VHg_GsFoKNX3'

let _sb: SupabaseClient | null = null

function sbClient(): SupabaseClient | null {
  if (!_sb && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _sb
}

export function sbReady(): boolean { return !!sbClient() }

export async function sbPush(key: string, data: unknown): Promise<void> {
  const sb = sbClient()
  if (!sb) return
  await sb.from('months').upsert({ key, data, updated_at: new Date().toISOString() })
}

export async function sbPullAll(): Promise<Array<{ key: string; data: unknown }> | null> {
  const sb = sbClient()
  if (!sb) return null
  const { data, error } = await sb.from('months').select('key, data')
  return error ? null : data
}
