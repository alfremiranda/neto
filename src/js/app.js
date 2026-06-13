function switchMonth(key) {
  curKey = key;
  loadForm(key);
  renderMonthNav();
  recalc();
}

function prevMonth() {
  const [y, m] = curKey.split('-').map(Number);
  if (m === 0) return;
  const prevKey = monthKey(m - 1, y);
  if (!db[prevKey]) {
    const current = getMonth(curKey);
    db[prevKey] = { trm: current.trm, transfer_date: '', pv: current.pv, incomes: [], gastos: { ...current.gastos, extras: [] } };
    save();
    toast('Mes creado');
  }
  switchMonth(prevKey);
}

function nextMonth() {
  const [y, m] = curKey.split('-').map(Number);
  if (m === 11) return;
  const nextKey = monthKey(m + 1, y);
  if (!db[nextKey]) {
    const current = getMonth(curKey);
    db[nextKey] = { trm: current.trm, transfer_date: '', pv: current.pv, incomes: [], gastos: { ...current.gastos, extras: [] } };
    save();
    toast('Mes creado');
  }
  switchMonth(nextKey);
}

function addIncome() {
  const desc     = $('i-desc').value.trim();
  const amount   = parseFloat($('i-amt').value) || 0;
  const currency = $('i-cur').value;
  const account  = $('i-acc').value.trim() || 'Otro';
  const tipo     = $('i-tipo').value;
  if (!desc || !amount) { toast('Ingresa descripción y monto'); return; }
  const d = getMonth(curKey);
  d.incomes.push({ id: Date.now(), desc, amount, currency, account, tipo });
  db[curKey] = d;
  save();
  $('i-desc').value = '';
  $('i-amt').value  = '';
  toast('Ingreso agregado');
  recalc();
}

function addExtra() {
  const desc   = $('extra-desc').value.trim();
  const amount = parseCOP($('extra-amt').value);
  if (!desc || !amount) { toast('Ingresa descripción y monto'); return; }
  const d = getMonth(curKey);
  if (!d.gastos.extras) d.gastos.extras = [];
  d.gastos.extras.push({ id: Date.now(), desc, amount });
  db[curKey] = d;
  save();
  $('extra-desc').value = '';
  $('extra-amt').value  = '';
  recalc();
}

function deleteExtra(id) {
  const d = getMonth(curKey);
  d.gastos.extras = (d.gastos.extras || []).filter(e => e.id !== id);
  db[curKey] = d;
  save();
  recalc();
}

function setPendingDelete(id) {
  pendingDeleteId = id;
  recalc();
}

function deleteIncome(id) {
  pendingDeleteId = null;
  const d = getMonth(curKey);
  d.incomes = d.incomes.filter(i => i.id !== id);
  db[curKey] = d;
  save();
  toast('Ingreso eliminado');
  recalc();
}

function saveMonth() {
  const d = getMonth(curKey);
  d.trm = parseFloat($('p-trm').value) || DEFAULTS.trm;
  d.transfer_date = $('p-transfer-date').value || '';
  db[curKey] = d;
  save();
  toast('Transferencia guardada');
  recalc();
}

function saveSettings() {
  const [y] = curKey.split('-');
  const v = parseCOP($('s-smmlv').value) || DEFAULTS.smmlv;
  if (!db._settings) db._settings = { smmlv: {} };
  if (!db._settings.smmlv) db._settings.smmlv = {};
  db._settings.smmlv[y] = v;
  saveLocal();
  sbPush('_settings', db._settings).catch(() => {});
  toast('SMMLV ' + y + ' guardado');
  recalc();
}

// Init
load();
const now = new Date();
curKey = monthKey(now.getMonth(), now.getFullYear());
if (!db[curKey]) {
  const existingKeys = Object.keys(db).filter(k => k !== '_settings').sort();
  if (existingKeys.length > 0) {
    const prev = getMonth(existingKeys[existingKeys.length - 1]);
    db[curKey] = { trm: prev.trm, transfer_date: '', pv: prev.pv, incomes: [], gastos: { ...prev.gastos, extras: [] } };
  }
}
loadForm(curKey);
renderMonthNav();
recalc();
initChart();
initAnnual();
initNumberHints();

// Gastos auto-save
GASTOS_KEYS.forEach(k => {
  const el = $('g-' + k);
  if (!el) return;
  el.addEventListener('input', () => {
    const d = getMonth(curKey);
    d.gastos[k] = parseCOP(el.value);
    db[curKey] = d;
    save();
    recalc();
  });
});

// Pensión voluntaria auto-save
const pvEl = $('p-pv');
if (pvEl) {
  pvEl.addEventListener('input', () => {
    const d = getMonth(curKey);
    d.pv = parseCOP(pvEl.value);
    db[curKey] = d;
    save();
    recalc();
  });
}

// TRM: recalc en vivo, se guarda con el botón
const trmEl = $('p-trm');
if (trmEl) trmEl.addEventListener('input', recalc);

// TRM en vivo
initLiveTRM();

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Sync Supabase
if (sbReady()) {
  syncFromCloud().then(() => {
    renderMonthNav();
    loadForm(curKey);
    recalc();
  });
}
