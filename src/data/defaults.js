const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const GASTOS_KEYS = ['arriendo','servicios','internet','mercado','tarjetas','transporte','streaming','salud','otros'];

const EGRESO_TIPOS = [
  { id: 'arriendo',    label: 'Arriendo' },
  { id: 'servicios',   label: 'Servicios públicos' },
  { id: 'internet',    label: 'Internet / cel' },
  { id: 'mercado',     label: 'Mercado' },
  { id: 'tarjetas',    label: 'Tarjetas' },
  { id: 'transporte',  label: 'Transporte' },
  { id: 'streaming',   label: 'Streaming' },
  { id: 'salud',       label: 'Salud prepagada' },
  { id: 'pension_vol', label: 'Pensión voluntaria' },
  { id: 'otro',        label: 'Otro' },
];

const TRANSFER_ACCOUNTS = [
  { id: 'ARQ',         label: 'ARQ (Observer Hub)', currency: 'USD' },
  { id: 'Toptal',      label: 'Toptal',              currency: 'USD' },
  { id: 'Bancolombia', label: 'Bancolombia',          currency: 'COP' },
  { id: 'NU',          label: 'NU',                   currency: 'COP' },
  { id: 'Nequi',       label: 'Nequi',                currency: 'COP' },
];

const DEFAULTS = {
  trm: 3567.11,
  pv: 2000000,
  smmlv: 1750905,
  salud_prepagada: 2000000,
  arq_savings_rate: 0.035,
  ss_salud: 0.125,
  ss_pens: 0.16,
  ss_arl: 0.00522,
  ibc_factor: 0.40,
  retencion: 0.20,
  primas: 0.0833,
};
