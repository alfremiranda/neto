const $ = id => document.getElementById(id);
const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const bar = (id, a, b) => { const p = b > 0 ? Math.min(Math.round(a / b * 100), 100) : 0; $(id).style.width = p + '%'; };

const parseCOP = str => parseInt(String(str).replace(/\D/g, '')) || 0;
const copFormat = n => n > 0 ? Math.round(n).toLocaleString('es-CO') : '';

function initCOPInput(el) {
  el.type = 'text';
  el.setAttribute('inputmode', 'numeric');
  el.addEventListener('input', function() {
    const raw = this.value.replace(/\D/g, '');
    const num = parseInt(raw) || 0;
    const formatted = num > 0 ? num.toLocaleString('es-CO') : '';
    if (this.value !== formatted) this.value = formatted;
  });
}

function openSheet(id) {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('active'));
  $('overlay').classList.add('active');
  const sheet = $(id);
  if (sheet) {
    sheet.classList.add('active');
    setTimeout(() => sheet.querySelector('input,select')?.focus(), 60);
  }
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('active'));
  $('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

let pendingDeleteId = null;

function renderEgresos() {
  const el = $('egresos-list');
  if (!el) return;
  const egresos = getMonth(curKey).egresos || [];
  const trm     = getMonth(curKey).trm;
  if (!egresos.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📤</div><p>Sin egresos este mes</p><button class="btn btn-p btn-sm" onclick="openSheet('sheet-egreso')">＋ Agregar egreso</button></div>`;
    return;
  }
  el.innerHTML = egresos.map(e => {
    const tipo   = EGRESO_TIPOS.find(t => t.id === e.tipo) || { label: e.tipo };
    const amtStr = e.currency === 'USD' ? USD(e.amount) : COP(e.amount);
    const subStr = e.currency === 'USD' ? COP(e.amount * trm) : '';
    const dateStr = e.date ? e.date.slice(5).replace('-', '/') : '';
    return `
      <div class="income-item">
        <div class="ii-l">
          <div class="ii-d">${tipo.label}</div>
          <div class="ii-m">
            <span class="badge b-otro">${e.tipo}</span>
            ${dateStr ? `<span style="color:var(--txt3)">· ${dateStr}</span>` : ''}
          </div>
        </div>
        <div class="ii-r">
          <div class="ii-a">${amtStr}</div>
          ${subStr ? `<div class="ii-s">${subStr}</div>` : ''}
        </div>
        <button class="btn btn-d btn-icon" onclick="deleteEgreso(${e.id})">✕</button>
      </div>`;
  }).join('');
}

function renderMonthNav() {
  const [y, m] = curKey.split('-');
  $('month-title').textContent = MONTHS[parseInt(m)] + ' ' + y;
  const mn = parseInt(m);
  const prev = $('btn-prev'); if (prev) prev.disabled = mn === 0;
  const next = $('btn-next'); if (next) next.disabled = mn === 11;
}

const _hintUpdaters = [];

function _addHint(el, updateFn) {
  const hint = document.createElement('div');
  hint.className = 'num-hint';
  el.parentNode.appendChild(hint);
  const update = () => { hint.textContent = updateFn(parseFloat(el.value) || 0); };
  el.addEventListener('input', update);
  _hintUpdaters.push(update);
  update();
  return update;
}

function initNumberHints() {
  ['s-smmlv'].forEach(id => {
    const el = $(id);
    if (el) initCOPInput(el);
  });

  // TRM: hint debajo con formato + unidad
  const trmEl = $('p-trm');
  if (trmEl) _addHint(trmEl, v => v > 0 ? v.toLocaleString('es-CO', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' COP/USD' : '');

  // Monto ingreso: hint muestra equivalente con moneda
  const amtEl = $('i-amt'), curEl = $('i-cur');
  if (amtEl && curEl) {
    const hint = document.createElement('div');
    hint.className = 'num-hint';
    amtEl.parentNode.appendChild(hint);
    const update = () => {
      const v = parseFloat(amtEl.value) || 0;
      if (!v) { hint.textContent = ''; return; }
      hint.textContent = curEl.value === 'USD' ? USD(v) : (v > 999 ? COP(v) : '');
    };
    amtEl.addEventListener('input', update);
    curEl.addEventListener('change', update);
    _hintUpdaters.push(update);
    update();
  }
}

function updateNumberHints() {
  _hintUpdaters.forEach(fn => fn());
}

function loadForm(key) {
  const d = getMonth(key);
  const [y] = key.split('-');
  const smmlvEl = $('s-smmlv');
  if (smmlvEl) smmlvEl.value = copFormat(getSMMLV(y));
  const lblY = $('s-smmlv-year');
  if (lblY) lblY.textContent = y;

  const tTransferTrm = $('t-trm');
  if (tTransferTrm) tTransferTrm.value = d.trm;
  updateNumberHints();
}

function recalc() {
  const d = getMonth(curKey);
  const trm = d.trm;
  const [year] = curKey.split('-');
  const smmlv = getSMMLV(year);

  const incomes = d.incomes || [];
  const egresos = d.egresos || [];
  const { totUSD, totCOP, bruto } = calcTotales(incomes, trm);

  const totalsEl = $('income-totals');
  if (totalsEl) totalsEl.style.display = incomes.length ? '' : 'none';
  set('tot-usd', USD(totUSD));
  set('tot-cop', COP(totCOP));
  set('tot-bruto', COP(bruto));
  set('tot-bruto-u', USD(bruto / trm) + ' equiv.');

  const il = $('income-list');
  if (!incomes.length) {
    il.innerHTML = `<div class="empty-state"><div class="empty-icon">💸</div><p>Sin ingresos este mes</p><button class="btn btn-p btn-sm" onclick="openSheet('sheet-income')">＋ Registrar ingreso</button></div>`;
  } else {
    il.innerHTML = incomes.map(i => `
      <div class="income-item">
        <div class="ii-l">
          <div class="ii-d">${i.desc}</div>
          <div class="ii-m">
            <span class="badge ${i.currency === 'USD' ? 'b-usd' : 'b-cop'}">${i.currency}</span>
            <span class="badge b-otro">${i.account}</span>
          </div>
        </div>
        <div class="ii-r">
          <div class="ii-a">${i.currency === 'USD' ? USD(i.amount) : COP(i.amount)}</div>
          <div class="ii-s">${i.currency === 'USD' ? COP(i.amount * trm) : USD(i.amount / trm)}</div>
        </div>
        ${pendingDeleteId === i.id
          ? `<div style="display:flex;gap:5px;flex-shrink:0">
               <button class="btn btn-d btn-icon" onclick="deleteIncome(${i.id})">Eliminar</button>
               <button class="btn btn-icon" onclick="setPendingDelete(null)">No</button>
             </div>`
          : `<button class="btn btn-d btn-icon" onclick="setPendingDelete(${i.id})">✕</button>`
        }
      </div>`).join('');
  }

  const ibc = calcIBC(incomes, trm, smmlv);
  const ss  = calcSS(ibc, calcPV(egresos, trm));

  const ibcEsMinimo = ibc <= smmlv;
  set('o-ibc', COP(ibc));
  set('o-ibc-lbl', ibcEsMinimo ? 'mínimo SMMLV' : '40% ingresos servicios');

  set('o-salud', COP(ss.salud)); set('o-salud-u', USD(ss.salud / trm));
  set('o-pens',  COP(ss.pens));  set('o-pens-u',  USD(ss.pens / trm));
  set('o-arl',   COP(ss.arl));   set('o-arl-u',   USD(ss.arl / trm));
  set('o-pv',    COP(ss.pv));    set('o-pv-u',    USD(ss.pv / trm));
  set('o-total', COP(ss.total) + ' / ' + USD(ss.total / trm));

  const gast = calcGastos(egresos, trm);
  const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gast);

  bar('bss',  ss.total,             bruto); set('pss',  pct(ss.total, bruto)); set('vss',  COP(ss.total));
  bar('bgst', gast,                 bruto); set('pgst', pct(gast, bruto));     set('vgst', COP(gast));
  bar('bret', ret,                  bruto); set('pret', pct(ret, bruto));      set('vret', COP(ret));
  bar('bprim',prim,                 bruto); set('pprim',pct(prim, bruto));     set('vprim',COP(prim));
  bar('bnet', Math.max(netoLibre,0),bruto); set('pnet', pct(Math.max(netoLibre,0), bruto)); set('vnet', COP(Math.max(netoLibre, 0)));

  const flujo = calcFlujo(ss.total, gast, ret, prim, trm, totUSD);
  set('f-bancol-cop', COP(ss.total + gast));
  set('f-bancol',     USD(flujo.aBancol) + ' equiv.');
  set('f-arq',        USD(flujo.aARQ));
  set('f-arq-cop',    COP(ret + prim) + ' equiv.');
  set('f-neto',       USD(flujo.netoU));
  set('f-int',        '≈ ' + USD(flujo.interest) + '/mes');

  renderEgresos();
  renderTransfers();
  updateChart();
  updateAnnual();
}

function renderTransfers() {
  const el = $('transfers-list');
  if (!el) return;
  const transfers = (getMonth(curKey).transfers || []);
  if (!transfers.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔀</div><p>Sin movimientos este mes</p><button class="btn btn-p btn-sm" onclick="openSheet('sheet-transfer')">＋ Agregar movimiento</button></div>`;
    return;
  }
  el.innerHTML = '<div class="divider" style="margin:10px 0"></div>' + transfers.map(t => {
    const fromAcc = TRANSFER_ACCOUNTS.find(a => a.id === t.from) || { label: t.from };
    const toAcc   = TRANSFER_ACCOUNTS.find(a => a.id === t.to)   || { label: t.to };
    const fromStr = t.fromCurrency === 'USD' ? USD(t.amount) : COP(t.amount);
    const toStr   = t.toCurrency   === 'USD' ? USD(t.toAmount) : COP(t.toAmount);
    const trmStr  = t.trm ? ' @' + t.trm.toLocaleString('es-CO', {minimumFractionDigits:2,maximumFractionDigits:2}) : '';
    const dateStr = t.date ? t.date.slice(5).replace('-', '/') : '';
    return `
      <div class="transfer-item">
        <div class="ti-l">
          <div class="ti-route">${fromAcc.label} → ${toAcc.label}${dateStr ? '<span class="ti-date">' + dateStr + '</span>' : ''}</div>
          <div class="ti-detail">${fromStr} → ${toStr}${trmStr}</div>
        </div>
        <button class="btn btn-d btn-icon" onclick="deleteTransfer(${t.id})">✕</button>
      </div>`;
  }).join('');
}
