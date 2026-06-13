const COP = n => '$' + Math.round(n).toLocaleString('es-CO');
const USD = n => 'USD ' + (Math.round(n * 100) / 100).toLocaleString('es-CO', { minimumFractionDigits:2, maximumFractionDigits:2 });
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '0%';

function calcTotales(incomes, trm) {
  let totUSD = 0, totCOP = 0;
  incomes.forEach(i => { if (i.currency === 'USD') totUSD += i.amount; else totCOP += i.amount; });
  return { totUSD, totCOP, bruto: totUSD * trm + totCOP };
}

function calcIBC(incomes, trm, smmlv) {
  const totalServicios = incomes
    .filter(i => (i.tipo || 'servicios') === 'servicios')
    .reduce((a, i) => a + (i.currency === 'USD' ? i.amount * trm : i.amount), 0);
  return Math.max(totalServicios * DEFAULTS.ibc_factor, smmlv);
}

function calcSS(ibc) {
  const salud = ibc * DEFAULTS.ss_salud;
  const pens  = ibc * DEFAULTS.ss_pens;
  const arl   = ibc * DEFAULTS.ss_arl;
  return { salud, pens, arl, total: salud + pens + arl };
}

function calcGastos(egresos, trm) {
  return (egresos || [])
    .reduce((a, e) => a + (e.currency === 'USD' ? e.amount * (trm || DEFAULTS.trm) : e.amount), 0);
}

function calcDistribucion(bruto, ssTot, gast) {
  const ret  = bruto * DEFAULTS.retencion;
  const prim = bruto * DEFAULTS.primas;
  const netoLibre = bruto - ssTot - gast - ret - prim;
  return { ret, prim, netoLibre };
}

function calcFlujo(ssTot, gast, ret, prim, trm, totUSD) {
  const aBancol  = (ssTot + gast) / trm;
  const aARQ     = (ret + prim) / trm;
  const netoU    = totUSD - aBancol - aARQ;
  const interest = aARQ * (DEFAULTS.arq_savings_rate / 12);
  return { aBancol, aARQ, netoU, interest };
}
