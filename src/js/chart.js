let trendChart = null;

function chartColors() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    grid:        dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    tick:        dark ? '#636366' : '#999',
    tooltipBg:   dark ? '#2c2c2e' : '#fff',
    tooltipText: dark ? '#f2f2f7' : '#1a1a1a',
    border:      dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  };
}

function buildChartData() {
  const allKeys = [...new Set([...Object.keys(db).filter(k => k !== '_settings').sort(), curKey])];
  const keys = allKeys.slice(-8);

  const labels = [], dSS = [], dGast = [], dRet = [], dPrim = [], dNeto = [];
  const M = 1_000_000;

  keys.forEach(k => {
    const [y, m] = k.split('-');
    labels.push(MONTHS[parseInt(m)].slice(0, 3) + ' \'' + y.slice(2));

    const d        = getMonth(k);
    const trm      = d.trm;
    const incomes  = d.incomes || [];
    const { bruto }          = calcTotales(incomes, trm);
    const ibc                = calcIBC(incomes, trm, getSMMLV(k.split('-')[0]));
    const ss                 = calcSS(ibc, d.pv);
    const gastTotal          = calcGastos(d.gastos);
    const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gastTotal);

    dSS.push(  +(ss.total          / M).toFixed(3));
    dGast.push(+(gastTotal         / M).toFixed(3));
    dRet.push( +(ret               / M).toFixed(3));
    dPrim.push(+(prim              / M).toFixed(3));
    dNeto.push(+(Math.max(netoLibre, 0) / M).toFixed(3));
  });

  return { labels, dSS, dGast, dRet, dPrim, dNeto };
}

function initChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const c = chartColors();
  const { labels, dSS, dGast, dRet, dPrim, dNeto } = buildChartData();

  trendChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'SS',          data: dSS,   backgroundColor: '#378ADD', stack: 'a' },
        { label: 'Manutención', data: dGast,  backgroundColor: '#1D9E75', stack: 'a' },
        { label: 'Retención',   data: dRet,   backgroundColor: '#EF9F27', stack: 'a' },
        { label: 'Primas',      data: dPrim,  backgroundColor: '#D4537E', stack: 'a' },
        { label: 'Neto libre',  data: dNeto,  backgroundColor: '#639922', stack: 'a' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: c.tick, boxWidth: 10, padding: 14, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.tooltipText,
          bodyColor: c.tooltipText,
          borderColor: c.border,
          borderWidth: 0.5,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-CO', { minimumFractionDigits:2 })}M`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: c.tick, font: { size: 11 } },
        },
        y: {
          stacked: true,
          grid: { color: c.grid },
          ticks: {
            color: c.tick,
            font: { size: 11 },
            callback: v => '$' + v + 'M',
          },
        },
      },
    },
  });
}

function updateChart() {
  if (!trendChart) return;
  const { labels, dSS, dGast, dRet, dPrim, dNeto } = buildChartData();
  trendChart.data.labels           = labels;
  trendChart.data.datasets[0].data = dSS;
  trendChart.data.datasets[1].data = dGast;
  trendChart.data.datasets[2].data = dRet;
  trendChart.data.datasets[3].data = dPrim;
  trendChart.data.datasets[4].data = dNeto;
  trendChart.update('active');
}
