# Neto — Planeador financiero personal

> **Contexto de producto** (funcionalidades, tipos de cuenta, categorías, reglas de negocio,
> perfiles de usuario, historial de features): ver [PRODUCT.md](./PRODUCT.md).
> Este archivo cubre stack, convenciones de código y ambientes.

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
- Deploy: GitHub Pages (custom domain) → https://netofinanzas.app
- Tests: **Vitest** (`npm test`). El motor de sync (`src/store/merge.ts`) tiene red en `src/store/merge.test.ts`.

## Definition of Done (toda tarea)
Antes de dar algo por terminado: `npm run build` (compila) **y** `npm test` (verde). Si tocaste el motor
de sync, los tests de `merge.test.ts` deben seguir verdes y se agregan casos, nunca se debilitan. La app
funciona online **y** offline. Cumple Tailwind v3. Código/commits/docs en inglés. Si tocó datos/esquema/prod,
se confirmó antes y se probó en dev/local primero.

**Sincronización de docs (hábitos permanentes — el trabajo es multi-agente; lo no committeado+pusheado NO EXISTE para los demás):**
- Cambio **user-facing o de reglas de negocio** → actualizar [PRODUCT.md](./PRODUCT.md) en el mismo cambio.
- Cambio de **plan / secuencia** → actualizar [NORTH_STAR.md](./NORTH_STAR.md).
- Si tocaste **tokens o componentes del design system** → re-correr `/design-sync` para republicar.
- **Push al cerrar cada tarea** (no acumular commits locales). `docs/DIRECTION.md` es entrada, no se edita a mano.

**El push no termina hasta que el run termina.** `git push` y esperar el workflow son **una sola
operación**, no dos pasos opcionales:

```
git push origin main && gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status
```

Y verificar el resultado, no el color: `gh run list --status success --limit 1 --json headSha`
debe coincidir con `git rev-parse HEAD`. Un run verde de *otro* commit no dice nada del tuyo.

Por qué está aquí: el deploy corre `npm audit --audit-level=high` y los tests antes de construir,
así que **puede bloquear producción en silencio**. Un aviso nuevo en una dependencia transitiva
—que aparece sin que nadie toque el repo— deja el run en rojo y prod congelada en el último commit
que pasó. Ocurrió: `nanoid` entró por `postcss` y prod sirvió el mismo build durante siete commits,
incluidos dos fixes que el usuario había reportado. Estaban committeados, pusheados y verificados
en local; no habían llegado a su teléfono. Lo detectó él abriendo Actions, no yo.

Si el run falla por un aviso nuevo: `npm audit fix` (suele ser solo el lockfile), verificar
`npm audit --audit-level=high` en local, y volver a empujar. **No** re-correr el run fallido
(apila artifacts — ver la sección de deploy más abajo).

## ⚠️ El design system manda sobre Tailwind — siempre

**El sistema de diseño (Diseño + Figma) es el SSOT de toda la UI.** Tokens, primitivas,
elementos y componentes están *por encima* de lo que Tailwind pueda ofrecer. Tailwind es el
**respaldo**: entra cuando algo no existe en el DS y no hay antecedente de un componente
parecido — como último recurso, no como punto de partida.

El orden al resolver cualquier decisión de UI:

1. ¿Existe el **token**? (`design-system/tokens/tokens.css`) → úsalo.
2. ¿Existe el **estilo de texto**? (`.ts-*`, 26 estilos) → úsalo. Nunca `text-[Npx]`/`font-*`.
3. ¿Existe el **componente**? (`Button`, `IconButton`, `Input`…) → úsalo, no lo re-implementes
   con markup crudo.
4. ¿Hay un **antecedente** de algo equivalente en `design-system/components/`? → síguelo.
5. Solo si nada de lo anterior aplica, Tailwind — y entonces **pregúntale a Diseño**
   (`docs/inbox/design/Q-…`) si eso debería existir en el DS.

Corolarios que ya nos costaron trabajo:
- Una utilidad de Tailwind que pisa un `.ts-*` es un bug, no una preferencia: las utilidades
  ganan en cascada, así que el estilo semántico queda mudo (fue el caso de `size="xl"` en
  `Button`, y de `.field-label` escribiendo `Label/Base` a mano en 35 sitios).
- Un token generado que nadie lee es deuda: `input/menu/*`, `input/color/label` y
  `border/focus` estuvieron ahí sin consumirse.
- Si el DS **no** especifica algo (p. ej. el truncamiento del valor de un select), implementa lo
  seguro y **abre un `Q-` a Diseño** para que el DS lo cubra. No lo dejes como criterio del código.

## ⚠️ Tailwind v3 — restricciones críticas
Este proyecto usa **Tailwind CSS v3**, NO v4. Cualquier sintaxis v4 es silenciosamente ignorada.

**Prohibido (son sintaxis v4):**
- `@utility` blocks
- `@theme inline { ... }`
- `tw-animate-css` (usa `@utility` internamente — no funciona en v3)

**Para animaciones:** usar el plugin `tailwindcss-animate` (ya instalado, registrado en `tailwind.config.js`). Provee `animate-in`, `fade-in-0`, `zoom-in-95`, `data-[state=closed]:animate-out`, etc.

**Para colores con opacidad:** usar `color-mix()` vía la función `cv()` definida en `tailwind.config.js`, no la sintaxis `bg-color/50` con oklch vars.

## ⚠️ Service worker (PWA) — NO cambiar a `autoUpdate`
El SW usa `registerType: 'prompt'` en `vite.config.ts`, **NO** `'autoUpdate'`, y se registra manualmente en `main.tsx` (`registerSW` con `onRegisterError`; `injectRegister: null`). Con `autoUpdate`, cada deploy genera un SW nuevo que **fuerza un reload al activarse**, y en móvil ese reload pisaba el callback de OAuth → login roto (raíz confirmada de la regresión de W4). Si vuelves a `autoUpdate`, se rompe el login móvil. La página estática de privacidad va en `navigateFallbackDenylist` para que el fallback de la SPA no la sombree.

## ⚠️ Deploy de GitHub Pages — no re-correr runs fallidos
Si el deploy de Pages falla, **no uses `gh run rerun`**: cada rerun apila otro artifact `github-pages` en el run y `deploy-pages` rechaza con *"Multiple artifacts named github-pages"*. La cura es un **run fresco** — un commit nuevo (aunque sea `--allow-empty`). El primer fallo suele ser un timeout transitorio de la API de Pages de GitHub (`updating_pages`), no del código.

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
- Sync es **automática** (solo prod): auto-push confiable por-clave tras cada mutación (cola `dirty` con reintento en `flushPending`), y auto-pull al abrir la app (`INITIAL_SESSION`/`SIGNED_IN`) y al enfocar/reconectar (`focus`/`visibilitychange`/`online`). En **dev** no hay auto-sync (manual).
- **Merge por-entrada** (`mergeMonth`/`mergeList` en `financeStore.ts`): las listas del mes (incomes/egresos/transfers/voluntarias) se **unen por `id`** — ninguna entrada se pierde entre dispositivos; gana el `updatedAt` más nuevo por entrada (fallback al ts del mes para entradas viejas sin stamp). Los borrados se propagan con **tombstones** `MonthData.deleted` (`"<tipo>:<id>" → ms`): una entrada se elimina si su tombstone ≥ su último `updatedAt`. Salida ordenada por id (determinista) → los dispositivos convergen sin ping-pong. `syncFromCloud` hace push-back (`localHasExtra`) de los meses donde local aporta algo que la nube no tiene. `_settings` es LWW de objeto completo (no por-entrada). Escalares del mes (`trm`, `balances`) por LWW de mes. La transición converge sola (unión), sin acción manual. Botones en Configuración = overrides manuales

## Roadmap
1. ~~Refactor: migrar a React + Vite + TypeScript~~ ✓
2. ~~Agregar gráfica de tendencia mensual~~ ✓
3. ~~Vista de resumen anual~~ ✓
4. Migrar storage a Supabase (auth con GitHub o Google)
5. PWA completa con service worker
6. ~~Fix: primas mensual~~ ✓ (provisión mensual 8.33%, pago real en jun/dic)
7. Fix: aria-labels en botones icono y htmlFor en formularios
8. Fix: rows de AnnualTable con role="button" + teclado

## Cross-domain direction (business · legal · design)

Decisions from the business, legal, and design workstreams (claude.ai Project "Neto") are
distilled into [docs/DIRECTION.md](./docs/DIRECTION.md) — auto-generated by the Cowork bridge,
do not edit by hand. Read it at session start and treat it as input for priorities and
constraints; code conventions stay in this file and sequencing stays in NORTH_STAR.md.

How the whole multi-agent system works (who the agents are, the sync channels, your session
protocol, handoff conventions): [docs/ORCHESTRATION.md](./docs/ORCHESTRATION.md). Read it once
per session.
