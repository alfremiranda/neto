# Neto — Planeador financiero personal

## Contexto
App web para Alfredo Miranda, diseñador senior en Barranquilla, Colombia.
Gestiona ingresos en USD (contrato fijo vía ARQ Dollar App + freelance Toptal)
y obligaciones en COP (seguridad social colombiana, egresos de manutención).

## Stack
- Vite + React 19 + TypeScript
- **Tailwind CSS v3** + shadcn/ui (estilo radix-nova/mist)
- Zustand para estado global
- localStorage para storage local (`amd-finance`)
- Supabase para sync entre dispositivos
- Deploy: GitHub Pages → alfremiranda.github.io/neto

## ⚠️ Tailwind v3 — restricciones críticas
Este proyecto usa **Tailwind CSS v3**, NO v4. Cualquier sintaxis v4 es silenciosamente ignorada.

**Prohibido (son sintaxis v4):**
- `@utility` blocks
- `@theme inline { ... }`
- `tw-animate-css` (usa `@utility` internamente — no funciona en v3)

**Para animaciones:** usar el plugin `tailwindcss-animate` (ya instalado, registrado en `tailwind.config.js`). Provee `animate-in`, `fade-in-0`, `zoom-in-95`, `data-[state=closed]:animate-out`, etc.

**Para colores con opacidad:** usar `color-mix()` vía la función `cv()` definida en `tailwind.config.js`, no la sintaxis `bg-color/50` con oklch vars.

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
- **Gastos** — salidas del mes. Este es el label de UI (más friendly); en código, tipos y esquema de datos la clave sigue siendo `egresos`/`Egreso`. Nunca "manutención" en la UI.
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

## Ambientes (dev / prod)

Dos proyectos Supabase separados para evitar contaminar datos de producción durante desarrollo.

| Ambiente | URL | Credenciales |
|---|---|---|
| **Dev** (localhost) | `https://mgstntazthxrnvzejlxd.supabase.co` | `.env.local` (no committeado) |
| **Prod** (GitHub Pages) | `https://fhpskefipslrgwkfzmng.supabase.co` | `.env.production` (committeado) |

- `.env.local` — ignorado por git (`*.local` en `.gitignore`), apunta a Supabase dev
- `.env.production` — committeado, apunta a Supabase prod
- `src/lib/supabase.ts` lee `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Dos GitHub OAuth Apps: "neto" (prod) y "neto-dev" (dev), cada una con su callback URL de Supabase
- Sync es **automática** (solo prod): auto-push confiable por-clave tras cada mutación (cola `dirty` con reintento en `flushPending`), y auto-pull al abrir la app (`INITIAL_SESSION`/`SIGNED_IN`) y al enfocar/reconectar (`focus`/`visibilitychange`/`online`). El merge es no destructivo, LWW por mes vía `updatedAt` (ms local) vs `updated_at` (Supabase); las claves `dirty` locales siempre ganan. Los botones en Configuración son overrides manuales (reconciliación). Límite conocido: borrar un mes completo no se propaga entre dispositivos (los borrados de entradas sí, porque actualizan el blob del mes). En **dev** no hay auto-sync (se usa manual)

## Roadmap
1. ~~Refactor: migrar a React + Vite + TypeScript~~ ✓
2. ~~Agregar gráfica de tendencia mensual~~ ✓
3. ~~Vista de resumen anual~~ ✓
4. Migrar storage a Supabase (auth con GitHub o Google)
5. PWA completa con service worker
6. ~~Fix: primas mensual~~ ✓ (provisión mensual 8.33%, pago real en jun/dic)
7. Fix: aria-labels en botones icono y htmlFor en formularios
8. Fix: rows de AnnualTable con role="button" + teclado
