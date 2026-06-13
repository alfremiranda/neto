let db = {}, curKey = '';

function monthKey(m, y) {
  return y + '-' + String(m).padStart(2, '0');
}

function getSMMLV(year) {
  const s = db._settings;
  return (s && s.smmlv && s.smmlv[String(year)]) || DEFAULTS.smmlv;
}

function getMonth(k) {
  return db[k] || {
    trm: DEFAULTS.trm,
    transfer_date: '',
    pv: DEFAULTS.pv,
    incomes: [],
    gastos: { arriendo:0, servicios:0, internet:0, mercado:0, tarjetas:0, transporte:0, streaming:0, salud: DEFAULTS.salud_prepagada, otros:0, extras: [] },
  };
}

function load() {
  try { const r = localStorage.getItem('amd-finance'); if (r) db = JSON.parse(r); } catch(e) { db = {}; }
  migrateIfNeeded();
}

function migrateIfNeeded() {
  if (db._settings && db._settings.smmlv) return;
  const byYear = {};
  Object.keys(db).filter(k => k !== '_settings' && db[k] && db[k].smmlv).forEach(k => {
    const y = k.split('-')[0];
    if (!byYear[y]) byYear[y] = db[k].smmlv;
  });
  if (Object.keys(byYear).length) {
    if (!db._settings) db._settings = {};
    db._settings.smmlv = byYear;
    saveLocal();
  }
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
  rows.forEach(({ key, data }) => {
    if (key === '_settings') {
      if (!db._settings) db._settings = data;
      else if (data && data.smmlv) {
        if (!db._settings.smmlv) db._settings.smmlv = {};
        Object.assign(db._settings.smmlv, data.smmlv);
      }
    } else {
      db[key] = data;
    }
  });

  for (const key of Object.keys(db)) {
    if (!cloudKeys.has(key)) await sbPush(key, db[key]);
  }

  saveLocal();
}
