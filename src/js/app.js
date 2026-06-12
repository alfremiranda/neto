function switchMonth(key) {
  curKey = key;
  loadForm(key);
  renderTabs();
  recalc();
}

function addIncome() {
  const desc = $('i-desc').value.trim();
  const amount = parseFloat($('i-amt').value) || 0;
  const currency = $('i-cur').value;
  const account  = $('i-acc').value;
  if (!desc || !amount) { toast('Ingresa descripción y monto'); return; }
  const d = getMonth(curKey);
  d.incomes.push({ id: Date.now(), desc, amount, currency, account });
  db[curKey] = d;
  save();
  $('i-desc').value = '';
  $('i-amt').value  = '';
  toast('Ingreso agregado');
  recalc();
}

function deleteIncome(id) {
  const d = getMonth(curKey);
  d.incomes = d.incomes.filter(i => i.id !== id);
  db[curKey] = d;
  save();
  toast('Eliminado');
  recalc();
}

function saveMonth() {
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
  renderTabs();
  toast('Mes guardado');
  recalc();
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
