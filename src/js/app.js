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
    db[prevKey] = { trm: current.trm, transfer_date: '', pv: current.pv, incomes: [], transfers: [], gastos: { ...current.gastos, extras: [] } };
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
    db[nextKey] = { trm: current.trm, transfer_date: '', pv: current.pv, incomes: [], transfers: [], gastos: { ...current.gastos, extras: [] } };
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
  closeSheet();
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

function onTransferAccountChange() {
  const fromId = $('t-from') && $('t-from').value;
  const toId   = $('t-to')   && $('t-to').value;
  const from   = TRANSFER_ACCOUNTS.find(a => a.id === fromId);
  const to     = TRANSFER_ACCOUNTS.find(a => a.id === toId);
  const cross  = from && to && from.currency !== to.currency;
  const row    = $('t-trm-row');
  if (row) row.style.display = cross ? '' : 'none';
  const lbl = $('t-amt-lbl');
  if (lbl) lbl.textContent = 'Monto' + (from ? ' (' + from.currency + ')' : '');
  updateTransferResult();
}

function updateTransferResult() {
  const fromId = $('t-from') && $('t-from').value;
  const toId   = $('t-to')   && $('t-to').value;
  const from   = TRANSFER_ACCOUNTS.find(a => a.id === fromId);
  const to     = TRANSFER_ACCOUNTS.find(a => a.id === toId);
  const amount = parseFloat($('t-amt') && $('t-amt').value) || 0;
  const trmEl  = $('t-trm');
  const trm    = (trmEl && parseFloat(trmEl.value)) || getMonth(curKey).trm;
  const el     = $('t-result');
  if (!el) return;
  if (!from || !to || !amount) { el.textContent = ''; return; }
  if (from.currency === 'USD' && to.currency === 'COP') {
    el.textContent = '→ ' + COP(amount * trm);
  } else if (from.currency === 'COP' && to.currency === 'USD') {
    el.textContent = '→ ' + USD(amount / trm);
  } else {
    el.textContent = from.currency === 'USD' ? '→ ' + USD(amount) : '→ ' + COP(amount);
  }
}

function addTransfer() {
  const fromId = $('t-from').value;
  const toId   = $('t-to').value;
  const amount = parseFloat($('t-amt').value) || 0;
  const date   = $('t-date').value;
  if (!amount) { toast('Ingresa el monto'); return; }
  if (fromId === toId) { toast('Las cuentas deben ser distintas'); return; }
  const from  = TRANSFER_ACCOUNTS.find(a => a.id === fromId);
  const to    = TRANSFER_ACCOUNTS.find(a => a.id === toId);
  const cross = from && to && from.currency !== to.currency;
  const trm   = cross ? (parseFloat($('t-trm').value) || getMonth(curKey).trm) : null;
  let toAmount = amount;
  if (from.currency === 'USD' && to.currency === 'COP') toAmount = amount * trm;
  else if (from.currency === 'COP' && to.currency === 'USD') toAmount = amount / trm;
  const d = getMonth(curKey);
  if (!d.transfers) d.transfers = [];
  d.transfers.push({ id: Date.now(), date: date || new Date().toISOString().slice(0, 10), from: fromId, to: toId, amount, fromCurrency: from.currency, toCurrency: to.currency, trm, toAmount });
  db[curKey] = d;
  save();
  $('t-amt').value = '';
  $('t-result').textContent = '';
  toast('Movimiento registrado');
  closeSheet();
  renderTransfers();
}

function deleteTransfer(id) {
  const d = getMonth(curKey);
  d.transfers = (d.transfers || []).filter(t => t.id !== id);
  db[curKey] = d;
  save();
  renderTransfers();
}

function initTransfers() {
  const opts = TRANSFER_ACCOUNTS.map(a => `<option value="${a.id}">${a.label} (${a.currency})</option>`).join('');
  const fromSel = $('t-from'), toSel = $('t-to');
  if (fromSel) { fromSel.innerHTML = opts; fromSel.value = 'ARQ'; }
  if (toSel)   { toSel.innerHTML   = opts; toSel.value   = 'Bancolombia'; }
  const dateEl = $('t-date');
  if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
  const trmEl = $('t-trm');
  if (trmEl) trmEl.value = getMonth(curKey).trm;
  if (fromSel) fromSel.addEventListener('change', onTransferAccountChange);
  if (toSel)   toSel.addEventListener('change', onTransferAccountChange);
  const amtEl = $('t-amt');
  if (amtEl) amtEl.addEventListener('input', updateTransferResult);
  if (trmEl) trmEl.addEventListener('input', updateTransferResult);
  onTransferAccountChange();
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
    db[curKey] = { trm: prev.trm, transfer_date: '', pv: prev.pv, incomes: [], transfers: [], gastos: { ...prev.gastos, extras: [] } };
  }
}
loadForm(curKey);
renderMonthNav();
recalc();
initChart();
initAnnual();
initNumberHints();
initTransfers();

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

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

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
