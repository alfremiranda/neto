let _sb = null;

function sbClient() {
  if (!_sb && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

function sbReady() { return !!sbClient(); }

async function sbPush(key, data) {
  const sb = sbClient();
  if (!sb) return;
  await sb.from('months').upsert({ key, data, updated_at: new Date().toISOString() });
}

async function sbPullAll() {
  const sb = sbClient();
  if (!sb) return null;
  const { data, error } = await sb.from('months').select('key, data');
  return error ? null : data;
}
