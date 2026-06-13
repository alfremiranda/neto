const TRM_CACHE_KEY = 'neto-trm-live';
const TRM_CACHE_TTL = 8 * 3600 * 1000; // 8 horas

function getCachedLiveTRM() {
  try {
    const c = JSON.parse(localStorage.getItem(TRM_CACHE_KEY) || 'null');
    if (c && (Date.now() - c.ts) < TRM_CACHE_TTL) return c;
  } catch(e) {}
  return null;
}

function setCachedLiveTRM(trm, source) {
  try {
    localStorage.setItem(TRM_CACHE_KEY, JSON.stringify({ trm, source, ts: Date.now() }));
  } catch(e) {}
}

function abortIn(ms) {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function fetchLiveTRM() {
  // Fuente primaria: TRM oficial Banco de la República (Superfinanciera)
  try {
    const res = await fetch(
      'https://www.datos.gov.co/resource/mcec-87by.json?$limit=1&$order=vigenciadesde+DESC',
      { signal: abortIn(6000) }
    );
    if (res.ok) {
      const [row] = await res.json();
      if (row?.valor) {
        const trm = parseFloat(row.valor);
        setCachedLiveTRM(trm, 'Banco de la República');
        return { trm, source: 'Banco de la República' };
      }
    }
  } catch(e) {}

  // Fallback: open exchange rates
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: abortIn(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.COP) {
        const trm = Math.round(data.rates.COP * 100) / 100;
        setCachedLiveTRM(trm, 'ExchangeRate');
        return { trm, source: 'ExchangeRate' };
      }
    }
  } catch(e) {}

  return null;
}

function renderLiveTRM(trm, fresh) {
  const el = $('trm-live-hdr');
  if (!el || !trm) return;
  const dot = fresh ? '●' : '○';
  const title = fresh ? 'Actualizado ahora' : 'Desde caché (< 8h)';
  el.innerHTML = `<span class="trm-live-dot ${fresh ? 'trm-live-fresh' : 'trm-live-cache'}" title="${title}">${dot}</span> TRM&nbsp;${trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  updateUseLiveTRMBtn(trm);
}

function updateUseLiveTRMBtn(trm) {
  const btn = $('btn-use-live-trm');
  if (!btn || !trm) return;
  btn.textContent = trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  btn.title = 'Usar TRM de hoy';
  btn.onclick = () => {
    const el = $('p-trm');
    el.value = trm;
    el.dispatchEvent(new Event('input'));
    toast('TRM de hoy aplicado');
  };
}

async function initLiveTRM() {
  // Mostrar caché inmediatamente si existe
  const cached = getCachedLiveTRM();
  if (cached) renderLiveTRM(cached.trm, false);

  // Refrescar en background
  const result = await fetchLiveTRM();
  if (result) renderLiveTRM(result.trm, true);
}
