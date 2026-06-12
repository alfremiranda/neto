const $ = id => document.getElementById(id);
const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const bar = (id, a, b) => { const p = b > 0 ? Math.min(Math.round(a / b * 100), 100) : 0; $(id).style.width = p + '%'; };

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function accBadge(a) {
  return ({ ARQ:'b-arq', Toptal:'b-toptal', Bancolombia:'b-bancol', Otro:'b-otro' }[a] || 'b-otro');
}

function setSyncStatus(status) {
  const dot = $('sync-dot');
  if (!dot) return;
  const map = { synced: '#1D9E75', syncing: '#EF9F27', offline: 'var(--txt3)' };
  dot.style.background = map[status] || map.offline;
  dot.title = { synced: 'Sincronizado', syncing: 'Sincronizando…', offline: 'Sin conexión / no configurado' }[status];
}

function renderAuthState(user) {
  const w = $('auth-widget');
  if (!w) return;
  if (!sbReady()) { w.innerHTML = ''; return; }

  if (user) {
    const name  = user.user_metadata?.full_name || user.email || 'Usuario';
    const avatar = user.user_metadata?.avatar_url;
    w.innerHTML = `
      <div class="auth-user" onclick="sbSignOut().then(() => renderAuthState(null))">
        ${avatar ? `<img src="${avatar}" class="auth-avatar" alt="">` : `<div class="auth-initial">${name[0].toUpperCase()}</div>`}
        <span class="auth-name">${name.split(' ')[0]}</span>
      </div>`;
  } else {
    w.innerHTML = `
      <div style="display:flex;gap:5px">
        <button class="btn auth-login-btn" onclick="sbSignIn('google')">Google</button>
        <button class="btn auth-login-btn" onclick="sbSignIn('github')">GitHub</button>
      </div>`;
  }
}

function renderTabs() {
  const wrap = $('month-tabs');
  const keys = [...new Set([curKey, ...Object.keys(db).sort().reverse().slice(0, 11)])];
  wrap.innerHTML = keys.map(k => {
    const [y, m] = k.split('-');
    return `<button class="tab${k === curKey ? ' active' : ''}" onclick="switchMonth('${k}')">${MONTHS[parseInt(m)]} ${y}</button>`;
  }).join('');
}

function loadForm(key) {
  const d = getMonth(key);
  const [y, m] = key.split('-');
  $('sel-m').value = parseInt(m);
  $('sel-y').value = y;
  $('p-trm').value = d.trm;
  $('p-pv').value = d.pv;
  $('p-smmlv').value = d.smmlv;
  GASTOS_KEYS.forEach(k => { const el = $('g-' + k); if (el) el.value = d.gastos[k] || 0; });
}

function recalc() {
  const d = getMonth(curKey);
  const trm = d.trm;

  $('trm-hdr').textContent = 'TRM ' + trm.toLocaleString('es-CO', { minimumFractionDigits:2, maximumFractionDigits:2 });

  const incomes = d.incomes || [];
  const { totUSD, totCOP, bruto } = calcTotales(incomes, trm);

  set('tot-usd', USD(totUSD));
  set('tot-cop', COP(totCOP));
  set('tot-bruto', COP(bruto));
  set('tot-bruto-u', USD(bruto / trm) + ' equiv.');

  const il = $('income-list');
  if (!incomes.length) {
    il.innerHTML = '<div class="empty">Sin ingresos registrados</div>';
  } else {
    il.innerHTML = incomes.map(i => `
      <div class="income-item">
        <div class="ii-l">
          <div class="ii-d">${i.desc}</div>
          <div class="ii-m"><span class="badge ${i.currency === 'USD' ? 'b-usd' : 'b-cop'}">${i.currency}</span> <span class="badge ${accBadge(i.account)}">${i.account}</span></div>
        </div>
        <div class="ii-r">
          <div class="ii-a">${i.currency === 'USD' ? USD(i.amount) : COP(i.amount)}</div>
          <div class="ii-s">${i.currency === 'USD' ? COP(i.amount * trm) : USD(i.amount / trm)}</div>
        </div>
        <button class="btn btn-d" style="padding:5px 8px" onclick="deleteIncome(${i.id})">✕</button>
      </div>`).join('');
  }

  const ibc = calcIBC(incomes, trm, d.smmlv);
  const ss  = calcSS(ibc, d.pv);

  set('o-salud', COP(ss.salud)); set('o-salud-u', USD(ss.salud / trm));
  set('o-pens',  COP(ss.pens));  set('o-pens-u',  USD(ss.pens / trm));
  set('o-arl',   COP(ss.arl));   set('o-arl-u',   USD(ss.arl / trm));
  set('o-pv',    COP(ss.pv));    set('o-pv-u',    USD(ss.pv / trm));
  set('o-total', COP(ss.total) + ' / ' + USD(ss.total / trm));

  const gast = calcGastos(d.gastos);
  const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gast);

  bar('bss',  ss.total,             bruto); set('pss',  pct(ss.total, bruto));
  bar('bgst', gast,                 bruto); set('pgst', pct(gast, bruto));
  bar('bret', ret,                  bruto); set('pret', pct(ret, bruto));
  bar('bprim',prim,                 bruto); set('pprim',pct(prim, bruto));
  bar('bnet', Math.max(netoLibre,0),bruto); set('pnet', pct(Math.max(netoLibre,0), bruto));

  const flujo = calcFlujo(ss.total, gast, ret, prim, trm, totUSD);
  set('f-bancol', USD(flujo.aBancol));
  set('f-arq',    USD(flujo.aARQ));
  set('f-neto',   USD(flujo.netoU));
  set('f-int',    '≈ ' + USD(flujo.interest) + '/mes');

  updateChart();
  updateAnnual();
}
