function buildAnnualData(year) {
  const rows = [];
  let totUSD = 0, totCOP = 0, totBruto = 0;
  let totSS = 0, totGast = 0, totRet = 0, totPrim = 0, totNeto = 0;

  for (let idx = 0; idx < 12; idx++) {
    const k = monthKey(idx, year);
    if (!db[k]) continue;

    const d       = db[k];
    const trm     = d.trm;
    const incomes = d.incomes || [];
    const { totUSD: mUSD, totCOP: mCOP, bruto } = calcTotales(incomes, trm);
    const ibc     = calcIBC(incomes, trm, getSMMLV(k.split('-')[0]));
    const ss      = calcSS(ibc, d.pv);
    const gast    = calcGastos(d.gastos);
    const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gast);
    const neto    = Math.max(netoLibre, 0);

    totUSD  += mUSD;  totCOP  += mCOP;  totBruto += bruto;
    totSS   += ss.total; totGast += gast; totRet += ret; totPrim += prim; totNeto += neto;

    rows.push({ idx, mes: MONTHS[idx].slice(0, 3), bruto, ss: ss.total, gast, ret, prim, neto, key: k });
  }

  return { rows, totUSD, totCOP, totBruto, totSS, totGast, totRet, totPrim, totNeto };
}

function renderAnnual() {
  const sel  = $('annual-year');
  const wrap = $('annual-body');
  if (!sel || !wrap) return;

  const year = parseInt(sel.value);
  const { rows, totUSD, totCOP, totBruto, totSS, totGast, totNeto } = buildAnnualData(year);

  if (!rows.length) {
    wrap.innerHTML = `<div class="empty">Sin meses registrados en ${year}</div>`;
    return;
  }

  const row = (r) => `
    <tr class="annual-row${r.key === curKey ? ' annual-cur' : ''}" onclick="switchMonth('${r.key}')">
      <td class="ac-mes">${r.mes}</td>
      <td class="ac-r">${COP(r.bruto)}</td>
      <td class="ac-r" style="color:#378ADD">${COP(r.ss)}</td>
      <td class="ac-r" style="color:#1D9E75">${COP(r.gast)}</td>
      <td class="ac-r ac-neto">${COP(r.neto)}</td>
    </tr>`;

  wrap.innerHTML = `
    <div class="metric-grid" style="margin-bottom:14px">
      <div class="metric">
        <div class="ml">Bruto total año</div>
        <div class="mv" style="font-size:15px">${COP(totBruto)}</div>
        <div class="ms">${USD(totUSD)} + ${COP(totCOP)}</div>
      </div>
      <div class="metric">
        <div class="ml">SS pagado</div>
        <div class="mv" style="font-size:15px;color:#378ADD">${COP(totSS)}</div>
        <div class="ms">${pct(totSS, totBruto)} del bruto</div>
      </div>
      <div class="metric">
        <div class="ml">Manutención</div>
        <div class="mv" style="font-size:15px;color:#1D9E75">${COP(totGast)}</div>
        <div class="ms">${pct(totGast, totBruto)} del bruto</div>
      </div>
      <div class="metric">
        <div class="ml">Neto libre acum.</div>
        <div class="mv" style="font-size:15px;color:#639922">${COP(totNeto)}</div>
        <div class="ms">${pct(totNeto, totBruto)} del bruto</div>
      </div>
    </div>
    <div style="overflow-x:auto">
      <table class="annual-tbl">
        <thead>
          <tr>
            <th style="text-align:left">Mes</th>
            <th style="text-align:right">Bruto COP</th>
            <th style="text-align:right">SS</th>
            <th style="text-align:right">Manut.</th>
            <th style="text-align:right">Neto libre</th>
          </tr>
        </thead>
        <tbody>${rows.map(row).join('')}</tbody>
        <tfoot>
          <tr>
            <td class="ac-mes" style="color:var(--txt3);font-size:11px">TOTAL</td>
            <td class="ac-r" style="font-weight:600">${COP(totBruto)}</td>
            <td class="ac-r" style="font-weight:600;color:#378ADD">${COP(totSS)}</td>
            <td class="ac-r" style="font-weight:600;color:#1D9E75">${COP(totGast)}</td>
            <td class="ac-r ac-neto" style="font-weight:700">${COP(totNeto)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
}

function initAnnual() {
  const sel = $('annual-year');
  if (!sel) return;

  const years = [...new Set([
    ...Object.keys(db).filter(k => k !== '_settings').map(k => k.split('-')[0]),
    String(new Date().getFullYear()),
  ])].sort().reverse();

  const cur = String(new Date().getFullYear());
  sel.innerHTML = years.map(y => `<option value="${y}"${y === cur ? ' selected' : ''}>${y}</option>`).join('');
  sel.addEventListener('change', renderAnnual);
  renderAnnual();
}

function updateAnnual() {
  renderAnnual();
}
