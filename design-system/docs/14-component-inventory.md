# 14 — Inventory: what is missing, measured

> **Barrido 2026-08-22.** Figma tiene **81** componentes publicables. Las cifras de más abajo son
> del 18 de agosto (71) y se conservan como registro de ese momento; el estado de hoy está en
> §0, al principio a propósito, porque un inventario cuyo encabezado miente no es un inventario.

## 0. Estado al 2026-08-22

**81 en Figma · 57 en `_build/components.json`.** El registro que genera las páginas de
documentación es del 2 de agosto y está desfasado en tres direcciones a la vez:

| | |
|---|---|
| **26 componentes existen en Figma y no en el registro** | `Field` · `ChoiceRow` · `AccountRow` · `CurrencyRadio` · `Segment` · `SegmentedControl` · `Radio` · `Calendar Day` · `AccountColorSwatch` · `AccountColorPicker` · `AccountAvatar` · `AccountEditForm` · `SheetContent` · `AccountChart` · `AccountSummaryCard` · `AccountTypeBadge` · `obligation-itemrow` · `breadcrumb` · `breadcrumb-item` · `stepper` · `step-item` · `ErrorState` · `Spinner` · `Logo` · `brand-mark/google` · `brand-mark/flag` |
| **2 están en el registro y ya no en Figma** | `DatePicker` y `MoneyInput`, retirados dentro de `Field` el 20-ago |
| **23 cambiaron de número de variantes** | `Button` 72→168 · `Input` 24→30 · `AccountCard` 24→12 · `AccountBadge` 8→1 · `outcome-itemrow` 4→8 · `income-itemrow` 2→4 · y 17 más que constaban con 0 |

### Lo que se arregló en Figma el 22-ago

El barrido no era sólo de conteo. **28 de las 81 descripciones tenían defectos**, y ninguno se
veía sin buscarlo:

- **13 citaban tokens con nombres que la fase 1.2 retiró** — `interactive/primary`,
  `surface/scrim`, `account-accent/*`, `color/account/*`, `foreground/on-popover`,
  `status/danger`, `surface/inverse`. Corregidas todas; verificado a cero.
- **20 tenían basura literal** (`&#39;`, `&lt;`, y en un caso `&amp;quot;`, la huella de un
  intento anterior). Causa: **`use_figma` codifica `< > & ' "` en cada escritura**, así que
  decodificar y volver a escribir es un bucle que no termina. Se sustituyeron por caracteres que
  sí sobreviven — `{hue}` en vez de `<hue>`, comillas tipográficas en vez de rectas.
- **4 no tenían descripción**: `AccountChart`, `AccountSummaryCard`, `step-item`, `Logo`.
- **3 describían variantes que no existen** — mías, escritas sin comprobar el eje contra el
  componente: `AccountChart` decía `Series=Balance|Debt` cuando es `Single|Dual`; `step-item`
  inventaba un estado `Skipped`; `Logo` decía `Mark|Full` cuando es `Primary|Secondary`.
- **2 las rompió mi propio reemplazo mecánico** (`color/bg/brand`, “an bg/brand”) y las cacé
  releyendo el resultado. Un renombrado automático sobre prosa necesita una segunda pasada.

Hoy: **0 nombres muertos, 0 entidades, 0 componentes sin descripción, en los 81.**

### Lo que queda

`_build/components.json` sigue sin regenerarse. Es una **copia** de lo que vive en Figma, y hoy
demostramos que las copias se desincronizan en silencio — es el mismo defecto que tenía
`rename-map.json`. Regenerarlo es una exportación por lotes como la del volcado de tokens; no lo
hago a medias porque un registro mitad actual y mitad viejo, sin marca, es peor que uno viejo
entero.

**Measured 2026-08-18, updated 2026-08-19.** Everything here comes from counting, not from
remembering. Every row carries its evidence; where I could not measure, I say so instead of
estimating.

Method: an inventory of the top-level `COMPONENT_SET`/`COMPONENT` nodes across the ten
`Components · *` and `Blocks · *` pages in Figma, against `find src/components -name '*.tsx'` and
a grep of actual consumption. **Every node count was run twice** — see `00-principles §B5`.

- **Figma:** 71 publishable components at the time of the count.
- **Code:** 56 `.tsx` under `src/components/`, 24 of them in `ui/`.

The two numbers do not subtract: they do not describe the same set. This document is the map of
why.

---

## A. Exists in code, missing from Figma

This is the real gap: things the app draws today that the system does not know exist.

| # | What | Evidence | Status |
|---|---|---|---|
| 1 | **Spinner** | 6 sites: `App.tsx:50,142` · `LoginScreen.tsx:72,84` · `ConfigView.tsx:68,80`. All hand-rolled with raw values (`w-4 h-4`, `border-2`, `/30`) | ✅ **built** — `Components · Feedback`, `Size=S\|M`, C1–C4 audit at zero |
| 2 | **Annual charts** | `TrendChart` 295 lines · `EgresosCategoryChart` 286 · `AnnualTable` 167. One hand-built `<svg>` each, zero `recharts` in the project. Figma only has `AccountChart` | ❌ missing |
| 3 | **EgresosBreakdown** | 109 lines, no `<svg>` | ❌ missing |
| 4 | **Distribution bar** | `EgresosCard.tsx:67` — `flex h-2 rounded-full overflow-hidden gap-px`, segment widths from data and colours from `var(--…)` | ❌ missing |
| 5 | **Google mark** | `LoginScreen.tsx:17-20` — four `fill="#4285F4\|#34A853\|#FBBC05\|#EA4335"` | ✅ **built** in `Brand` as `brand-mark/google`, exempt from `C1`. See `16-marks.md` |
| 6 | **GitHub mark** | `LoginScreen.tsx:8-10` — one `path`, `fill="currentColor"` | ✅ **built** in the `Icon Library` as the glyph `github`, tokenised |
| 7 | **Drawer handle** | `EgresosCard.tsx:576` — `data-vaul-handle`, `h-1 w-10 rounded-full bg-[var(--border)]` | ❌ missing |

**On 5 and 6.** Not the same decision twice. A monochrome mark inheriting `currentColor` is a
system icon and gets tokenised like any other. A mark carrying four of another company's hexes
**cannot** be tokenised: its colours are not ours, they have no dark mode, and they must not
respond to the theme. It lives in `Brand` alongside the logo and is exempt from `C1` on purpose
and in writing — not by oversight.

**Unverified:** `ui/drawer.tsx` (4 consumers) is probably covered by `Sheet [4]` in
`Components · Overlays`, but I did not check it piece by piece. It is not counted as a gap until
I do.

---

## B. Exists in Figma, missing from code

This is **not a design gap**: it is the extraction queue. Only components already extracted to
code enter Storybook (`00-principles §B3`), so the work here is Dev's.

| What | References in `src/` |
|---|---|
| `NotificationBadge` | **0** |
| `action-chip` | **0** |
| `tab-navigation` | **0** |
| `breadcrumb` / `breadcrumb-item` | **0** (`Breadcrumb` in `lib/sentry.ts` is Sentry's, not this) |

**The one that hurts is `NotificationBadge`.** It has a component in Figma, and yet
`EgresosCard.tsx:519` redraws it inline:

```
absolute -top-1 -right-1 w-[15px] h-[15px] bg-[var(--primary)] rounded-full text-white
```

`w-[15px]`, `h-[15px]` and `text-white` are raw values. With the component in place, this is
exactly the defect the system was meant to prevent: the piece is not missing, its use is.

---

## C. Foundations missing on both sides

Not components. Layers that were absent, which is why every component that needed them invented
its own.

### C1. Elevation — **0 effect styles vs 21 uses in code** · ✅ resolved 2026-08-19

| class | times |
|---|---|
| `shadow-lg` | 10 |
| `shadow-sm` | 4 |
| `shadow-xl` | 2 |
| `shadow-md` | 2 |
| `shadow-2xl` | 1 |
| `shadow-[0_0_0_1px_var(--sidebar-border)]` | 1 |
| `shadow-[0_0_0_1px_var(--sidebar-accent)]` | 1 |

The first five are Tailwind defaults: nobody chose them, they came with the framework. The last
two are not shadows, they are **1px rings** — focus geometry written as a shadow because there
was nowhere else to put it.

**Resolved 2026-08-19:** Alfredo delegated the decision. Four rungs named by role
(`raised · menu · floating · overlay`), two shadow layers each and **one surface per rung**,
because in dark the shadow separates nothing — measured. See `17-elevation.md` and
`foundations/elevation.html`.

### C2. Motion — **0 tokens vs 28 hand-written durations** · ✅ resolved 2026-08-19

`grep duration-` in `src/`: `150` ×10 · `200` ×7 · `100` ×7 · `300` ×3 · `500` ×1. Zero duration
or curve tokens in `tokens.css`.

Five durations for three real intents (micro-response, transition, surface entrance) is the same
kind of drift colour had before the semantic layer: no single one is wrong, what is wrong is that
there is nowhere the decision gets made.

**Resolved 2026-08-19:** the motion layer exists — 5 durations and 4 curves, named from the count
above. See `15-motion.md`. The `Spinner` now spins on `motion/duration/spin` over
`motion/easing/spin`. Still open is the **migration** of the 28 hand-written durations, which is
a change in `src/**` and therefore Dev's.

---

## D. What is **not** missing, contrary to expectation

Recorded so nobody proposes it again without measuring.

- **Checkbox.** Zero `type="checkbox"` in all of `src/`. `ConsentScreen` — the place anyone would
  assume one, because it is a Ley 1581 consent — resolves with **two buttons**, which is also the
  correct shape for explicit consent. Building it today would be inventing demand.
- **Radix.** One primitive in the whole project: `@radix-ui/react-switch`. There is no primitive
  library to mirror.

---

## Added after the inventory

| date | component | where it came from |
|---|---|---|
| 2026-08-18 | `Spinner` | 6 hand-rolled copies in code, see §A1 |
| 2026-08-19 | `github` (glyph) and `brand-mark/google` | §A5 and §A6 |
| 2026-08-19 | **`CurrencyRadio`** + `brand-mark/flag` | drawn by Alfredo; cleaned up, documented and applied to the 8 screens of the Moneda step |

## Suggested order

1. ~~**C2 motion**~~ — ✅ done 2026-08-19.
2. ~~**A5 + A6 marks**~~ — ✅ done 2026-08-19, including the "authenticating" state with the `Spinner`.
3. ~~**C1 elevation**~~ — ✅ done 2026-08-19.
4. **A2–A4 charts and the distribution bar** — the big block, and the one that benefits most from
   1 and 3 already existing.
5. **B `NotificationBadge`** — not design work, a replacement in `src/`: a finding for Dev.
