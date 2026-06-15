let db = {}, curKey = '';

function monthKey(m, y) {
  return y + '-' + String(m).padStart(2, '0');
}

function getSMMLV(year) {
  const s = db._settings;
  return (s && s.smmlv && s.smmlv[String(year)]) || DEFAULTS.smmlv;
}

function getAccounts() {
  const s = db._settings;
  if (s && Array.isArray(s.accounts) && s.accounts.length > 0) return s.accounts;
  return TRANSFER_ACCOUNTS.map(a => ({ ...a, number: '', rate: a.id === 'ARQ' ? 3.5 : 0 }));
}

function saveAccountsConfig(accounts) {
  if (!db._settings) db._settings = {};
  db._settings.accounts = accounts;
  saveLocal();
  sbPush('_settings', db._settings).catch(() => {});
}

function makeDefaultEgresos() {
  const tipos = ['arriendo','servicios','internet','mercado','tarjetas','transporte','streaming','salud','pension_vol'];
  let id = Date.now();
  return tipos.map(tipo => ({ id: id++, tipo, amount: 0, currency: 'COP', date: '' }));
}

function getMonth(k) {
  return db[k] || { trm: DEFAULTS.trm, incomes: [], transfers: [], egresos: [] };
}

function load() {
  try { const r = localStorage.getItem('amd-finance'); if (r) db = JSON.parse(r); } catch(e) { db = {}; }
  migrateIfNeeded();
}

function migrateIfNeeded() {
  let changed = false;

  // Migrate SMMLV from per-month to _settings
  if (!db._settings || !db._settings.smmlv) {
    const byYear = {};
    Object.keys(db).filter(k => k !== '_settings' && db[k] && db[k].smmlv).forEach(k => {
      const y = k.split('-')[0];
      if (!byYear[y]) byYear[y] = db[k].smmlv;
    });
    if (Object.keys(byYear).length) {
      if (!db._settings) db._settings = {};
      db._settings.smmlv = byYear;
      changed = true;
    }
  }

  // Migrate gastos object + extras + pv → egresos array
  Object.keys(db).filter(k => k !== '_settings').forEach(k => {
    const m = db[k];
    if (!m || m.egresos) return;
    m.egresos = [];
    let id = Date.now();
    if (m.gastos) {
      GASTOS_KEYS.forEach(tipo => {
        if ((m.gastos[tipo] || 0) > 0)
          m.egresos.push({ id: id++, amount: m.gastos[tipo], currency: 'COP', date: '', tipo });
      });
      (m.gastos.extras || []).forEach(e => {
        m.egresos.push({ id: e.id || id++, amount: e.amount, currency: 'COP', date: '', tipo: 'otro' });
      });
    }
    if ((m.pv || 0) > 0)
      m.egresos.push({ id: id++, amount: m.pv, currency: 'COP', date: '', tipo: 'pension_vol' });
    changed = true;
  });

  // Add default egresos to months created after the refactor with empty egresos (not seeded yet)
  Object.keys(db).filter(k => k !== '_settings').forEach(k => {
    const m = db[k];
    if (!m || !Array.isArray(m.egresos) || m.egresos.length > 0 || m.egresosSeeded) return;
    m.egresos = makeDefaultEgresos();
    m.egresosSeeded = true;
    changed = true;
  });

  if (changed) saveLocal();
}

function saveLocal() {
  try { localStorage.setItem('amd-finance', JSON.stringify(db)); } catch(e) {}
}

function save() {
  saveLocal();
  sbPush(curKey, db[curKey]).catch(() => {});
}

async function syncFromCloud() {
  const rows = await sbPullAll();
  if (!rows) return;

  const cloudKeys = new Set(rows.map(r => r.key));
  const needsCloudUpdate = new Set();

  rows.forEach(({ key, data }) => {
    if (key === '_settings') {
      if (!db._settings) db._settings = data;
      else {
        if (data && data.smmlv) {
          if (!db._settings.smmlv) db._settings.smmlv = {};
          Object.assign(db._settings.smmlv, data.smmlv);
        }
        if (data && data.accounts && !db._settings.accounts) {
          db._settings.accounts = data.accounts;
        }
      }
    } else {
      const local = db[key];
      // If local has seeded egresos and cloud has none, preserve local and push back
      const localHasEgresos = local && local.egresosSeeded &&
        Array.isArray(local.egresos) && local.egresos.length > 0;
      const cloudLacksEgresos = !data || !Array.isArray(data.egresos) || data.egresos.length === 0;
      if (localHasEgresos && cloudLacksEgresos) {
        if (data) { data.egresos = local.egresos; data.egresosSeeded = true; }
        needsCloudUpdate.add(key);
      }
      db[key] = data;
    }
  });

  // Push keys missing from cloud
  for (const key of Object.keys(db)) {
    if (!cloudKeys.has(key)) await sbPush(key, db[key]).catch(() => {});
  }

  saveLocal();

  // Apply migrations to cloud data that still lacks egresos (old format / unseeded)
  const preSeeded = new Set(
    Object.keys(db).filter(k => k !== '_settings' && db[k] && db[k].egresosSeeded)
  );
  migrateIfNeeded();

  // Push back only months that changed: preserved locally or newly seeded by migration
  for (const key of Object.keys(db)) {
    if (key === '_settings') continue;
    const justSeeded = db[key] && db[key].egresosSeeded && !preSeeded.has(key);
    if (needsCloudUpdate.has(key) || justSeeded) {
      await sbPush(key, db[key]).catch(() => {});
    }
  }
}
