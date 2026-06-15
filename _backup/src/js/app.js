function showView(view) {
  $('view-mes').style.display = view === 'mes' ? '' : 'none';
  $('view-ano').style.display = view === 'ano' ? '' : 'none';
  $('nav-mes').classList.toggle('active', view === 'mes');
  $('nav-ano').classList.toggle('active', view === 'ano');
  if (view === 'ano') {
    updateAnnual();
    updateChart();
    if (typeof trendChart !== 'undefined' && trendChart) trendChart.resize();
  }
}

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
    db[prevKey] = { trm: current.trm, incomes: [], transfers: [], egresos: makeDefaultEgresos(), egresosSeeded: true };
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
    db[nextKey] = { trm: current.trm, incomes: [], transfers: [], egresos: makeDefaultEgresos(), egresosSeeded: true };
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

let _editingEgresoId = null;

function openAddEgreso() {
  _editingEgresoId = null;
  const titleEl = $('egreso-sheet-title');
  if (titleEl) titleEl.textContent = 'Agregar egreso';
  const btnEl = $('egreso-submit-btn');
  if (btnEl) btnEl.textContent = 'Agregar egreso';
  $('e-amt').value = '';
  $('e-date').value = new Date().toISOString().slice(0, 10);
  openSheet('sheet-egreso');
}

function editEgreso(id) {
  const d = getMonth(curKey);
  const e = (d.egresos || []).find(e => e.id === id);
  if (!e) return;
  _editingEgresoId = id;
  const titleEl = $('egreso-sheet-title');
  if (titleEl) titleEl.textContent = 'Editar egreso';
  const btnEl = $('egreso-submit-btn');
  if (btnEl) btnEl.textContent = 'Guardar cambios';
  $('e-tipo').value = e.tipo;
  $('e-cur').value  = e.currency;
  setMoneyInput($('e-amt'), e.amount, e.currency === 'USD' ? 2 : 0);
  $('e-date').value = e.date || '';
  openSheet('sheet-egreso');
}

function addEgreso() {
  const tipo    = $('e-tipo').value;
  const amount  = parseMoney($('e-amt').value);
  const cur     = $('e-cur').value;
  const date    = $('e-date').value;
  const editing = _editingEgresoId;
  const d = getMonth(curKey);
  if (!d.egresos) d.egresos = [];

  if (editing !== null) {
    const idx = d.egresos.findIndex(e => e.id === editing);
    if (idx !== -1) d.egresos[idx] = { ...d.egresos[idx], tipo, amount, currency: cur, date: date || '' };
    _editingEgresoId = null;
    toast('Egreso actualizado');
  } else {
    if (!amount) { toast('Ingresa el valor'); return; }
    d.egresos.push({ id: Date.now(), tipo, amount, currency: cur, date: date || new Date().toISOString().slice(0, 10) });
    toast('Egreso registrado');
  }

  db[curKey] = d;
  save();
  $('e-amt').value = '';
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
  const from   = getAccounts().find(a => a.id === fromId);
  const to     = getAccounts().find(a => a.id === toId);
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
  const from   = getAccounts().find(a => a.id === fromId);
  const to     = getAccounts().find(a => a.id === toId);
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
  const from  = getAccounts().find(a => a.id === fromId);
  const to    = getAccounts().find(a => a.id === toId);
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

function refreshTransferSelects() {
  const accounts = getAccounts();
  const opts = accounts.map(a => `<option value="${a.id}">${a.label} (${a.currency})</option>`).join('');
  const fromSel = $('t-from'), toSel = $('t-to');
  if (fromSel) { const v = fromSel.value; fromSel.innerHTML = opts; fromSel.value = accounts.find(a => a.id === v) ? v : (accounts[0] || {}).id; }
  if (toSel)   { const v = toSel.value;   toSel.innerHTML   = opts; toSel.value   = accounts.find(a => a.id === v) ? v : (accounts[1] || accounts[0] || {}).id; }
}

function initTransfers() {
  const accounts = getAccounts();
  const opts = accounts.map(a => `<option value="${a.id}">${a.label} (${a.currency})</option>`).join('');
  const fromSel = $('t-from'), toSel = $('t-to');
  const defaultFrom = (accounts.find(a => a.id === 'ARQ') || accounts[0] || {}).id;
  const defaultTo   = (accounts.find(a => a.id === 'Bancolombia') || accounts[1] || accounts[0] || {}).id;
  if (fromSel) { fromSel.innerHTML = opts; fromSel.value = defaultFrom; }
  if (toSel)   { toSel.innerHTML   = opts; toSel.value   = defaultTo; }
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

// --- Account config management ---
let _editingAccountId = null;

function openAddAccountConfig() {
  _editingAccountId = null;
  const t = $('acc-sheet-title'); if (t) t.textContent = 'Agregar cuenta';
  const d = $('acc-delete-btn'); if (d) d.style.display = 'none';
  $('acc-name').value = '';
  $('acc-cur').value = 'COP';
  $('acc-number').value = '';
  $('acc-rate').value = '';
  openSheet('sheet-account-edit');
}

function editAccountConfig(id) {
  const a = getAccounts().find(acc => acc.id === id);
  if (!a) return;
  _editingAccountId = id;
  const t = $('acc-sheet-title'); if (t) t.textContent = 'Editar cuenta';
  const d = $('acc-delete-btn'); if (d) d.style.display = '';
  $('acc-name').value = a.label;
  $('acc-cur').value = a.currency;
  $('acc-number').value = a.number || '';
  $('acc-rate').value = a.rate || '';
  openSheet('sheet-account-edit');
}

function saveAccountConfig() {
  const label    = $('acc-name').value.trim();
  const currency = $('acc-cur').value;
  const number   = $('acc-number').value.trim();
  const rate     = parseFloat(String($('acc-rate').value).replace(',', '.')) || 0;
  if (!label) { toast('Ingresa el nombre de la cuenta'); return; }
  let accounts = getAccounts();
  if (_editingAccountId) {
    const idx = accounts.findIndex(a => a.id === _editingAccountId);
    if (idx !== -1) accounts[idx] = { ...accounts[idx], label, currency, number, rate };
    toast('Cuenta actualizada');
  } else {
    accounts.push({ id: 'acc_' + Date.now(), label, currency, number, rate });
    toast('Cuenta agregada');
  }
  saveAccountsConfig(accounts);
  closeSheet();
  renderAccountCards();
  refreshTransferSelects();
  renderIcons();
}

function deleteAccountConfig() {
  if (!_editingAccountId) return;
  saveAccountsConfig(getAccounts().filter(a => a.id !== _editingAccountId));
  closeSheet();
  renderAccountCards();
  refreshTransferSelects();
  toast('Cuenta eliminada');
  renderIcons();
}

// --- Balance editor ---
let _editingBalanceId = null;

function openBalanceEditor(accountId) {
  _editingBalanceId = accountId;
  const a = getAccounts().find(acc => acc.id === accountId);
  if (!a) return;
  const t = $('bal-account-name'); if (t) t.textContent = a.label;
  const c = $('bal-currency');     if (c) c.textContent = a.currency;
  const bal = ((getMonth(curKey).balances) || {})[accountId] || 0;
  const el = $('bal-amount');
  if (el) setMoneyInput(el, bal, a.currency === 'USD' ? 2 : 0);
  openSheet('sheet-balance');
}

function saveBalance() {
  const amount = parseMoney($('bal-amount').value);
  if (!_editingBalanceId) return;
  const d = getMonth(curKey);
  if (!d.balances) d.balances = {};
  d.balances[_editingBalanceId] = amount;
  db[curKey] = d;
  save();
  toast('Saldo actualizado');
  closeSheet();
  renderAccountCards();
  renderIcons();
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
    db[curKey] = { trm: prev.trm, incomes: [], transfers: [], egresos: makeDefaultEgresos(), egresosSeeded: true };
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
    // Safety net: if sync overwrote seeded egresos with empty data, re-seed before rendering
    const d = getMonth(curKey);
    if (db[curKey] && Array.isArray(d.egresos) && d.egresos.length === 0 && !d.egresosSeeded) {
      d.egresos = makeDefaultEgresos();
      d.egresosSeeded = true;
      db[curKey] = d;
      save();
    }
    renderMonthNav();
    loadForm(curKey);
    recalc();
  });
}
