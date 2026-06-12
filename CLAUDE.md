# Finanzas AMD — Planeador financiero personal

## Contexto
App web para Alfredo Miranda, diseñador senior en Barranquilla, Colombia.
Gestiona ingresos en USD (contrato fijo vía ARQ Dollar App + freelance Toptal)
y obligaciones en COP (seguridad social colombiana, gastos de manutención).

## Stack
- HTML + CSS + JS vanilla (sin frameworks por ahora)
- localStorage para storage local
- Supabase (pendiente) para sync entre dispositivos
- Deploy: GitHub Pages → alfremiranda.github.io/finanzas-amd

## Reglas del negocio
- Salario fijo: $8,800 USD/mes (contrato Net 30, llega semana 1-2 del mes siguiente)
- Freelance Toptal: variable, se registra manualmente cada mes
- IBC = max(40% del ingreso ARQ en COP, SMMLV 2026 = $1,750,905)
- SS mensual: Salud 12.5% + Pensión 16% + ARL 0.522% sobre IBC
- Provisiones bimestrales: Retención 20% sobre ingreso bruto
- Provisiones Jun/Dic: Primas 8.33% sobre ingreso bruto
- TRM se actualiza manualmente al inicio de cada mes

## Estructura de datos (localStorage key: 'amd-finance')
{
  "2026-05": {
    "trm": 3567.11,
    "pv": 2000000,
    "smmlv": 1750905,
    "incomes": [{ "id": 1234, "desc": "...", "amount": 8800, "currency": "USD", "account": "ARQ" }],
    "gastos": { "arriendo": 0, "servicios": 0, ... }
  }
}

## Roadmap
1. Refactor: separar CSS/JS en archivos modulares
2. Agregar gráfica de tendencia mensual (Chart.js)
3. Vista de resumen anual
4. Migrar storage a Supabase (auth con GitHub o Google)
5. PWA completa con service worker