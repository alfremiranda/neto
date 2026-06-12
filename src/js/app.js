function switchMonth(key) {
  curKey = key;
  loadForm(key);
  renderTabs();
  recalc();
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
  const amount = parseFloat($('extra-amt').value) || 0;
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

function showNewMonth() {
  const form = $('new-month-form');
  if (form) form.style.display = 'block';
  // Pre-seleccionar el mes siguiente al actual
  const [y, m] = curKey.split('-');
  const next = new Date(parseInt(y), parseInt(m), 1);
  const sel = $('sel-m'); if (sel) sel.value = next.getMonth();
  const iny = $('sel-y'); if (iny) iny.value = next.getFullYear();
}

function hideNewMonth() {
  const form = $('new-month-form');
  if (form) form.style.display = 'none';
}

function saveMonth() {
  const formVisible = $('new-month-form')?.style.display !== 'none';

  if (formVisible) {
    // Crear mes nuevo con los parámetros actuales como punto de partida
    const m = parseInt($('sel-m').value);
    const y = parseInt($('sel-y').value);
    const newKey = monthKey(m, y);
    const d = getMonth(newKey);
    d.trm   = parseFloat($('p-trm').value)   || DEFAULTS.trm;
    d.pv    = parseFloat($('p-pv').value)    || 0;
    d.smmlv = parseFloat($('p-smmlv').value) || DEFAULTS.smmlv;
    db[newKey] = d;
    curKey = newKey;
    save();
    hideNewMonth();
    renderTabs();
    loadForm(curKey);
    toast('Mes creado');
    recalc();
  } else {
    // Guardar parámetros del mes actual
    const d = getMonth(curKey);
    d.trm   = parseFloat($('p-trm').value)   || DEFAULTS.trm;
    d.pv    = parseFloat($('p-pv').value)    || 0;
    d.smmlv = parseFloat($('p-smmlv').value) || DEFAULTS.smmlv;
    db[curKey] = d;
    save();
    toast('Parámetros guardados');
    recalc();
  }
}

// Init
load();
const now = new Date();
curKey = monthKey(now.getMonth(), now.getFullYear());
loadForm(curKey);
renderTabs();
recalc();
initChart();
initAnnual();
initNumberHints();

// Gastos: auto-guardar + recalc al cambiar cualquier campo
GASTOS_KEYS.forEach(k => {
  const el = $('g-' + k);
  if (!el) return;
  el.addEventListener('input', () => {
    const d = getMonth(curKey);
    d.gastos[k] = parseFloat(el.value) || 0;
    db[curKey] = d;
    save();
    recalc();
  });
});

// Parámetros: solo recalc (se guardan con el botón)
['p-trm','p-pv','p-smmlv'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', recalc); });

// Service worker (PWA offline)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Sync con Supabase al arrancar (si está configurado)
if (sbReady()) {
  syncFromCloud().then(() => {
    renderTabs();
    loadForm(curKey);
    recalc();
  });
}
