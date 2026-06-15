const $ = id => document.getElementById(id);
const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const icon = (name, size) => { const s = size || 15; return `<i data-lucide="${name}" width="${s}" height="${s}"></i>`; };
const renderIcons = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };
const bar = (id, a, b) => { const p = b > 0 ? Math.min(Math.round(a / b * 100), 100) : 0; $(id).style.width = p + '%'; };

const parseCOP = str => parseInt(String(str).replace(/\D/g, '')) || 0;
const parseMoney = str => parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0;
const copFormat = n => n > 0 ? Math.round(n).toLocaleString('es-CO') : '';

// Sets a numeric value onto a formatted money input
function setMoneyInput(el, num, decimals) {
  if (!el) return;
  el.value = (num || 0).toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Formats as-you-type. getDecimals: number or () => number (0=COP integer, 2=USD)
function initMoneyInput(el, getDecimals) {
  el.type = 'text';
  el.setAttribute('inputmode', 'decimal');
  el.addEventListener('input', function() {
    const dec = typeof getDecimals === 'function' ? getDecimals() : (getDecimals || 0);
    const raw = this.value.replace(/\./g, ''); // strip thousands dots
    const commaIdx = raw.indexOf(',');
    const hasComma = commaIdx !== -1 && dec > 0;
    const intRaw = (hasComma ? raw.slice(0, commaIdx) : raw).replace(/\D/g, '');
    const intNum = parseInt(intRaw) || 0;
    if (!intRaw && !hasComma) { this.value = ''; return; }
    const intFmt = intNum.toLocaleString('es-CO');
    if (hasComma) {
      const decStr = raw.slice(commaIdx + 1).replace(/\D/g, '').slice(0, dec);
      this.value = intFmt + ',' + decStr;
    } else {
      this.value = intFmt;
    }
  });
}

function initCOPInput(el) { initMoneyInput(el, 0); }

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

function renderAccountCards() {
  const el = $('account-cards');
  if (!el) return;
  const accounts = getAccounts();
  const balances = (getMonth(curKey).balances) || {};
  const trm = getMonth(curKey).trm || DEFAULTS.trm;
  el.innerHTML = accounts.map(a => {
    const bal = balances[a.id];
    const hasBal = bal != null;
    const balStr = hasBal
      ? (a.currency === 'USD' ? USD(bal) : COP(bal))
      : `<span style="color:var(--txt3);font-size:13px;font-weight:400">Tocar para ingresar</span>`;
    const monthlyInt = hasBal && a.rate > 0 ? bal * (a.rate / 100) / 12 : 0;
    const intStr = monthlyInt > 0
      ? `≈ ${a.currency === 'USD' ? USD(monthlyInt) : COP(monthlyInt)}/mes · ${a.rate}% a.a.`
      : '';
    const numStr = a.number ? `•••• ${String(a.number).slice(-4)}` : '';
    const badgeClass = a.currency === 'USD' ? 'b-usd' : 'b-cop';
    return `
      <div class="acc-card" onclick="openBalanceEditor('${a.id}')">
        <div class="acc-hdr">
          <span class="acc-name" title="${a.label}">${a.label}</span>
          <div style="display:flex;gap:3px;align-items:center;flex-shrink:0">
            <span class="badge ${badgeClass}">${a.currency}</span>
            <button class="btn btn-icon acc-cfg-btn" onclick="event.stopPropagation();editAccountConfig('${a.id}')" title="Configurar cuenta">${icon('settings-2', 11)}</button>
          </div>
        </div>
        ${numStr ? `<div class="acc-num">${numStr}</div>` : ''}
        <div class="acc-bal">${balStr}</div>
        ${intStr ? `<div class="acc-rate">${intStr}</div>` : ''}
      </div>`;
  }).join('');
  renderIcons();
}

function renderEgresos() {
  const el = $('egresos-list');
  if (!el) return;
  const egresos = getMonth(curKey).egresos || [];
  const trm     = getMonth(curKey).trm;
  if (!egresos.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('receipt', 28)}</div><p>Sin egresos este mes</p><button class="btn btn-p btn-sm" onclick="openAddEgreso()">${icon('plus', 13)} Agregar egreso</button></div>`;
    renderIcons(); return;
  }
  el.innerHTML = egresos.map(e => {
    const tipo    = EGRESO_TIPOS.find(t => t.id === e.tipo) || { label: e.tipo };
    const hasAmt  = e.amount > 0;
    const amtStr  = hasAmt ? (e.currency === 'USD' ? USD(e.amount) : COP(e.amount)) : '<span style="color:var(--txt3)">—</span>';
    const subStr  = hasAmt && e.currency === 'USD' ? COP(e.amount * trm) : '';
    const dateStr = e.date ? e.date.slice(5).replace('-', '/') : '';
    return `
      <div class="income-item">
        <div class="ii-l">
          <div class="ii-d">${tipo.label}</div>
          <div class="ii-m">
            <span class="badge b-otro">${e.currency}</span>
            ${dateStr ? `<span style="color:var(--txt3)">· ${dateStr}</span>` : ''}
          </div>
        </div>
        <div class="ii-r">
          <div class="ii-a">${amtStr}</div>
          ${subStr ? `<div class="ii-s">${subStr}</div>` : ''}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-icon" onclick="editEgreso(${e.id})" title="Editar">${icon('pencil', 14)}</button>
          <button class="btn btn-d btn-icon" onclick="deleteEgreso(${e.id})">${icon('x', 14)}</button>
        </div>
      </div>`;
  }).join('');
  renderIcons();
}

function renderMonthNav() {
  const [y, m] = curKey.split('-');
  $('month-title').textContent = MONTHS[parseInt(m)] + ' ' + y;
  const mn = parseInt(m);
  const prev = $('btn-prev'); if (prev) prev.disabled = mn === 0;
  const next = $('btn-next'); if (next) next.disabled = mn === 11;
}

function initNumberHints() {
  // SMMLV: COP integer
  const smmlvEl = $('s-smmlv');
  if (smmlvEl) initMoneyInput(smmlvEl, 0);

  // Egreso amount: COP integer or USD 2 decimals
  const eAmt = $('e-amt');
  if (eAmt) initMoneyInput(eAmt, () => ($('e-cur') && $('e-cur').value) === 'USD' ? 2 : 0);

  // Transfer amount: COP or USD based on from-account currency
  const tAmt = $('t-amt');
  if (tAmt) initMoneyInput(tAmt, () => {
    const from = TRANSFER_ACCOUNTS.find(a => a.id === ($('t-from') && $('t-from').value));
    return from && from.currency === 'USD' ? 2 : 0;
  });

  // Transfer TRM: always 2 decimals
  const tTrm = $('t-trm');
  if (tTrm) initMoneyInput(tTrm, 2);

  // Balance editor: currency depends on selected account
  const balEl = $('bal-amount');
  if (balEl) initMoneyInput(balEl, () => {
    const a = getAccounts().find(acc => acc.id === (typeof _editingBalanceId !== 'undefined' ? _editingBalanceId : null));
    return a && a.currency === 'USD' ? 2 : 0;
  });

  // Income amount: COP or USD + cross-currency hint
  const amtEl = $('i-amt'), curEl = $('i-cur');
  if (amtEl) {
    initMoneyInput(amtEl, () => curEl && curEl.value === 'USD' ? 2 : 0);
    if (curEl) {
      const hint = document.createElement('div');
      hint.className = 'num-hint';
      amtEl.parentNode.appendChild(hint);
      const update = () => {
        const v = parseMoney(amtEl.value);
        if (!v) { hint.textContent = ''; return; }
        hint.textContent = curEl.value === 'USD' ? USD(v) : (v > 999 ? COP(v) : '');
      };
      amtEl.addEventListener('input', update);
      curEl.addEventListener('change', update);
      update();
    }
  }
}

function updateNumberHints() {}

function loadForm(key) {
  const d = getMonth(key);
  const [y] = key.split('-');
  const smmlvEl = $('s-smmlv');
  if (smmlvEl) setMoneyInput(smmlvEl, getSMMLV(y), 0);
  const lblY = $('s-smmlv-year');
  if (lblY) lblY.textContent = y;

  setMoneyInput($('t-trm'), d.trm, 2);
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
    il.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('banknote', 28)}</div><p>Sin ingresos este mes</p><button class="btn btn-p btn-sm" onclick="openSheet('sheet-income')">${icon('plus', 13)} Registrar ingreso</button></div>`;
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
          : `<button class="btn btn-d btn-icon" onclick="setPendingDelete(${i.id})">${icon('x', 14)}</button>`
        }
      </div>`).join('');
  }

  const ibc = calcIBC(incomes, trm, smmlv);
  const ss  = calcSS(ibc);

  const ibcEsMinimo = ibc <= smmlv;
  set('o-ibc', COP(ibc));
  set('o-ibc-lbl', ibcEsMinimo ? 'mínimo SMMLV' : '40% ingresos servicios');

  set('o-salud', COP(ss.salud)); set('o-salud-u', USD(ss.salud / trm));
  set('o-pens',  COP(ss.pens));  set('o-pens-u',  USD(ss.pens / trm));
  set('o-arl',   COP(ss.arl));   set('o-arl-u',   USD(ss.arl / trm));
  set('o-total', COP(ss.total) + ' / ' + USD(ss.total / trm));

  const gast = calcGastos(egresos, trm);  // pension_vol now included here
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

  renderAccountCards();
  renderEgresos();
  renderTransfers();
  updateChart();
  updateAnnual();
  renderIcons();
}

function renderTransfers() {
  const el = $('transfers-list');
  if (!el) return;
  const transfers = (getMonth(curKey).transfers || []);
  if (!transfers.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('arrow-left-right', 28)}</div><p>Sin movimientos este mes</p><button class="btn btn-p btn-sm" onclick="openSheet('sheet-transfer')">${icon('plus', 13)} Agregar movimiento</button></div>`;
    renderIcons(); return;
  }
  el.innerHTML = '<div class="divider" style="margin:10px 0"></div>' + transfers.map(t => {
    const fromAcc = getAccounts().find(a => a.id === t.from) || { label: t.from };
    const toAcc   = getAccounts().find(a => a.id === t.to)   || { label: t.to };
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
        <button class="btn btn-d btn-icon" onclick="deleteTransfer(${t.id})">${icon('x', 14)}</button>
      </div>`;
  }).join('');
  renderIcons();
}
