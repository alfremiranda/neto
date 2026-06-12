let _sb = null;

function sbClient() {
  if (!_sb && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

function sbReady() { return !!sbClient(); }

async function sbGetUser() {
  const sb = sbClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

async function sbSignIn(provider = 'google') {
  const sb = sbClient();
  if (!sb) return;
  await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.href } });
}

async function sbSignOut() {
  const sb = sbClient();
  if (!sb) return;
  await sb.auth.signOut();
}

async function sbPush(key, data) {
  const sb = sbClient();
  if (!sb) return;
  const user = await sbGetUser();
  if (!user) return;
  await sb.from('months').upsert({
    user_id: user.id, key, data,
    updated_at: new Date().toISOString(),
  });
}

async function sbPullAll() {
  const sb = sbClient();
  if (!sb) return null;
  const user = await sbGetUser();
  if (!user) return null;
  const { data, error } = await sb.from('months').select('key, data').eq('user_id', user.id);
  return error ? null : data;
}

function sbOnAuthChange(callback) {
  const sb = sbClient();
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => callback(event, session?.user || null));
}
