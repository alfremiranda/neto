let db = {}, curKey = '';

function monthKey(m, y) {
  return y + '-' + String(m).padStart(2, '0');
}

function getMonth(k) {
  return db[k] || {
    trm: DEFAULTS.trm,
    pv: DEFAULTS.pv,
    smmlv: DEFAULTS.smmlv,
    incomes: [],
    gastos: { arriendo:0, servicios:0, internet:0, mercado:0, tarjetas:0, transporte:0, streaming:0, salud: DEFAULTS.salud_prepagada, otros:0 },
  };
}

function load() {
  try { const r = localStorage.getItem('amd-finance'); if (r) db = JSON.parse(r); } catch(e) { db = {}; }
}

function saveLocal() {
  try { localStorage.setItem('amd-finance', JSON.stringify(db)); } catch(e) {}
}

function save() {
  saveLocal();
  sbPush(curKey, db[curKey]).catch(() => {});
}

async function syncFromCloud() {
  setSyncStatus('syncing');
  const rows = await sbPullAll();
  if (!rows) { setSyncStatus('offline'); return; }

  // Cloud data wins for same key; push local-only months to cloud
  const cloudKeys = new Set(rows.map(r => r.key));
  rows.forEach(({ key, data }) => { db[key] = data; });

  for (const key of Object.keys(db)) {
    if (!cloudKeys.has(key)) await sbPush(key, db[key]);
  }

  saveLocal();
  setSyncStatus('synced');
}
