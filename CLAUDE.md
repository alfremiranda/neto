# Neto — Planeador financiero personal

## Contexto
App web para Alfredo Miranda, diseñador senior en Barranquilla, Colombia.
Gestiona ingresos en USD (contrato fijo vía ARQ Dollar App + freelance Toptal)
y obligaciones en COP (seguridad social colombiana, egresos de manutención).

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v3 + shadcn/ui (estilo radix-nova/mist)
- Zustand para estado global
- localStorage para storage local (`amd-finance`)
- Supabase para sync entre dispositivos
- Deploy: GitHub Pages → alfremiranda.github.io/neto

## Reglas del negocio
- Salario fijo: $8,800 USD/mes — contrato con Observer Hub LLC (Net 30, llega semana 1-2 del mes siguiente), pagos recibidos en cuenta ARQ (Dollar App)
- Freelance Toptal: variable, se registra manualmente cada mes
- IBC = max(40% × suma de TODOS los ingresos tipo "Servicios" del mes en COP, SMMLV 2026 = $1,750,905)
- Aplica sobre todos los ingresos por prestación de servicios independientemente de cuenta o moneda
- SS mensual: Salud 12.5% + Pensión 16% + ARL 0.522% sobre IBC
- Provisiones bimestrales: Retención 20% sobre ingreso bruto
- Provisiones mensuales: Primas 8.33% sobre ingreso bruto (provisión mensual; pago efectivo jun/dic)
- Retención se acumula en ARQ Savings (genera 3.5% anual) y se paga año vencido a la DIAN
- TRM corresponde a la fecha de transferencia de ARQ/Toptal → Bancolombia; se actualiza manualmente

## Terminología canónica
- **Ingresos** — entradas de dinero (USD o COP)
- **Egresos** — salidas/gastos del mes (nunca "gastos" ni "manutención" en la UI)
- **SS** — seguridad social (salud + pensión + ARL)
- **Retención** — provisión bimestral para DIAN
- **Primas** — provisión semestral (jun/dic)
- **Neto libre** — ingreso disponible después de todas las obligaciones

## Estructura de datos (localStorage key: 'amd-finance')
```json
{
  "2026-05": {
    "trm": 3567.11,
    "smmlv": 1750905,
    "incomes": [{ "id": 1234, "desc": "...", "amount": 8800, "currency": "USD", "account": "ARQ", "tipo": "servicios" }],
    "egresos": [{ "id": 5678, "amount": 2500000, "currency": "COP", "tipo": "arriendo" }],
    "transfers": []
  }
}
```

## Roadmap
1. ~~Refactor: migrar a React + Vite + TypeScript~~ ✓
2. ~~Agregar gráfica de tendencia mensual~~ ✓
3. ~~Vista de resumen anual~~ ✓
4. Migrar storage a Supabase (auth con GitHub o Google)
5. PWA completa con service worker
6. ~~Fix: primas mensual~~ ✓ (provisión mensual 8.33%, pago real en jun/dic)
7. Fix: aria-labels en botones icono y htmlFor en formularios
8. Fix: rows de AnnualTable con role="button" + teclado
