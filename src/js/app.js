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
    db[prevKey] = { trm: current.trm, incomes: [], transfers: [], egresos: [] };
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
    db[nextKey] = { trm: current.trm, incomes: [], transfers: [], egresos: [] };
    save();
    toast('Mes creado');
  }
  switchMonth(nextKey);
}

function addIncome() {
  const desc     = $('i-desc').value.trim();
  const amount   = parseMoney($('i-amt').value);
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

function addEgreso() {
  const tipo   = $('e-tipo').value;
  const amount = parseMoney($('e-amt').value);
  const cur    = $('e-cur').value;
  const date   = $('e-date').value;
  if (!amount) { toast('Ingresa el valor'); return; }
  const d = getMonth(curKey);
  if (!d.egresos) d.egresos = [];
  d.egresos.push({ id: Date.now(), tipo, amount, currency: cur, date: date || new Date().toISOString().slice(0, 10) });
  db[curKey] = d;
  save();
  $('e-amt').value = '';
  toast('Egreso registrado');
  closeSheet();
  recalc();
}

function deleteEgreso(id) {
  const d = getMonth(curKey);
  d.egresos = (d.egresos || []).filter(e => e.id !== id);
  db[curKey] = d;
  save();
  recalc();
}

function initEgresos() {
  const sel = $('e-tipo');
  if (sel) sel.innerHTML = EGRESO_TIPOS.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  const dateEl = $('e-date');
  if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
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
  const amount = parseMoney($('t-amt') && $('t-amt').value);
  const trmEl  = $('t-trm');
  const trm    = (trmEl && parseMoney(trmEl.value)) || getMonth(curKey).trm;
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
  const amount = parseMoney($('t-amt').value);
  const date   = $('t-date').value;
  if (!amount) { toast('Ingresa el monto'); return; }
  if (fromId === toId) { toast('Las cuentas deben ser distintas'); return; }
  const from  = TRANSFER_ACCOUNTS.find(a => a.id === fromId);
  const to    = TRANSFER_ACCOUNTS.find(a => a.id === toId);
  const cross = from && to && from.currency !== to.currency;
  const trm   = cross ? (parseMoney($('t-trm').value) || getMonth(curKey).trm) : null;
  let toAmount = amount;
  if (from.currency === 'USD' && to.currency === 'COP') toAmount = amount * trm;
  else if (from.currency === 'COP' && to.currency === 'USD') toAmount = amount / trm;
  const d = getMonth(curKey);
  if (!d.transfers) d.transfers = [];
  d.transfers.push({ id: Date.now(), date: date || new Date().toISOString().slice(0, 10), from: fromId, to: toId, amount, fromCurrency: from.currency, toCurrency: to.currency, trm, toAmount });
  if (cross && trm) d.trm = trm;
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
  if (trmEl) setMoneyInput(trmEl, getMonth(curKey).trm, 2);
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
    db[curKey] = { trm: prev.trm, incomes: [], transfers: [], egresos: [] };
  }
}
loadForm(curKey);
renderMonthNav();
recalc();
initChart();
initAnnual();
initNumberHints();
initTransfers();
initEgresos();

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
