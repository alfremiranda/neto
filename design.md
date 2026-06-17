# Neto — Design System

## Librería de componentes: shadcn/ui

**Todos los componentes de UI deben basarse en shadcn/ui** como fuente primaria.

- Antes de crear un componente nuevo, verificar si existe en [ui.shadcn.com/docs](https://ui.shadcn.com/docs).
- Si existe: instalar con `npx shadcn@latest add <component>` y extenderlo si es necesario.
- Si no existe en shadcn: construirlo usando primitivos de **Radix UI** (base de shadcn) y aplicar los tokens del sistema.
- Nunca reemplazar un componente shadcn con una implementación propia sin documentar el motivo.

Componentes disponibles en `src/components/ui/` que extienden shadcn:
- `Badge` — variantes de cuenta y moneda
- `SectionCard` — card con header estandarizado
- `DatePicker` — wrapper de Popover + Calendar
- `MoneyInput` — input con formato automático locale
- `Empty` — estado vacío compuesto

---

## Principios

1. **Semántica sobre apariencia** — los tokens describen el *propósito*, no el color.  
   `--color-expense` no `--n-pink`. Un cambio de paleta no toca los componentes.

2. **Tres capas, sin saltar** — Primitivos → Base (shadcn) → Dominio (Neto).  
   Los componentes solo consumen la capa de dominio o la base de shadcn.  
   Nunca valores oklch hardcodeados en JSX.

3. **Tailwind como shorthand** — las clases de Tailwind son aceptadas siempre que apunten a tokens existentes (ej. `bg-muted`, `text-foreground`). Se evita `text-[oklch(...)]` directo.

---

## Arquitectura de tokens

```
Layer 1 — Primitivos
  Tailwind color scale + valores oklch explícitos en :root
  No se usan directamente en componentes

       ↓

Layer 2 — Base (shadcn/ui)
  --background, --foreground, --card, --muted, --border,
  --primary, --destructive, --ring, --radius, etc.
  Usados por componentes shadcn y como fuente para la capa de dominio

       ↓

Layer 3 — Dominio (Neto)
  --color-{semantic}[-bg|-txt]
  Consumidos directamente en componentes
```

---

## Layer 3 — Tokens de dominio

### Financieros

| Token | Rol | Color primitivo |
|---|---|---|
| `--color-income` | Ingresos — fill / chart | primary blue |
| `--color-income-bg` | Ingresos — fondo badge | blue-50 |
| `--color-income-txt` | Ingresos — texto badge | blue-800 |
| `--color-expense` | Egresos — fill / chart | rose-500 |
| `--color-expense-bg` | Egresos — fondo | rose-50 |
| `--color-expense-txt` | Egresos — texto | rose-800 |
| `--color-provision` | Provisiones — fill / chart | emerald-600 |
| `--color-provision-bg` | Provisiones — fondo | emerald-50 |
| `--color-provision-txt` | Provisiones — texto | emerald-900 |
| `--color-tax` | Obligaciones tributarias — fill / chart | amber-400 |
| `--color-tax-txt` | Obligaciones tributarias — texto | amber-700 (WCAG AA ✓) |
| `--color-net` | Neto libre — fill / chart | cyan-500 |
| `--color-net-bg` | Neto libre — fondo | cyan-50 |
| `--color-net-txt` | Neto libre — texto | cyan-700 (WCAG AA ✓) |

### Psicología del color

```
Rojo/Rosa  → Egresos     — gasto, salida, atención
Ámbar      → Impuestos   → precaución, obligación
Verde      → Provisiones → ahorro, crecimiento, seguridad
Cian/Azul  → Neto libre  → resultado, claridad, disponibilidad
```

### Estados

| Token | Rol |
|---|---|
| `--color-danger` | Error / acción destructiva (`var(--destructive)`) |
| `--color-danger-bg` | Fondo de estado de error |
| `--color-danger-txt` | Texto de estado de error |

### Cuentas (badges)

| Token | Cuenta |
|---|---|
| `--color-account-arq[-bg|-txt]` | ARQ / Dollar App |
| `--color-account-toptal[-bg|-txt]` | Toptal |
| `--color-account-bancol[-bg|-txt]` | Bancolombia |
| `--color-account-other[-bg|-txt]` | Otras / genérico |

### Categorías de egresos

Prefijo `--cat-{id}` y `--cat-{id}-bg`. Los identificadores mapean 1:1 con `EGRESO_CATEGORIAS`.

| id | Token color | Token fondo |
|---|---|---|
| `vivienda` | `--cat-home` | `--cat-home-bg` |
| `alimentacion` | `--cat-food` | `--cat-food-bg` |
| `tecnologia` | `--cat-tech` | `--cat-tech-bg` |
| `bancario` | `--cat-bank` | `--cat-bank-bg` |
| `salud` | `--cat-health` | `--cat-health-bg` |
| `movilidad` | `--cat-transit` | `--cat-transit-bg` |
| `familia` | `--cat-family` | `--cat-family-bg` |
| `otro` | `--cat-other` | `--cat-other-bg` |

---

## Layer 2 — Base (shadcn — no modificar)

Tokens estructurales para layout, superficie y tipografía. Los componentes shadcn los consumen internamente.

```
Superficie:   --background  --card  --popover  --muted  --sidebar
Texto:        --foreground  --card-foreground  --muted-foreground
Bordes:       --border  --input  --ring
Acción:       --primary  --primary-foreground
Destrucción:  --destructive  --destructive-foreground
Espaciado:    --radius
```

Los componentes propios (no shadcn) consumen estos tokens directamente: `var(--card)`, `var(--border)`, `var(--muted-foreground)`.

---

## Tipografía

| Variable | Familia | Uso |
|---|---|---|
| `--font-sans` | Inter Variable | Cuerpo, UI general |
| `--font-mono` | Geist Mono Variable | Montos, números, headings |
| `--font-heading` | alias de `--font-mono` | `font-heading` en Tailwind |

```
h1 — 1.5rem / -0.02em  — titulos de vista
h2 — 1.25rem / -0.015em — títulos de sección
h3 — 1.125rem / -0.01em — subtítulos
h4 — 1rem               — card headers
texto base — 0.875rem
texto pequeño — 0.75rem  (text-xs)
texto micro — 0.6875rem  (text-[11px])
```

Amounts monetarios: siempre `font-heading tabular-nums`.

---

## Reglas de uso en componentes

### ✅ Correcto
```tsx
// Token semántico
<span className="text-[var(--color-expense)]">...</span>
<div style={{ background: `var(--color-provision-bg)` }}>...</div>

// Token shadcn como shorthand Tailwind
<p className="text-muted-foreground">...</p>
<div className="bg-card border border-border">...</div>
```

### ❌ Incorrecto
```tsx
// Valor primitivo hardcoded
<span style={{ color: 'oklch(0.56 0.22 13)' }}>...</span>

// Token de color genérico sin semántica
<span className="text-[var(--n-pink)]">...</span>

// Tailwind color hardcoded
<div className="bg-rose-100 text-rose-700">...</div>
```

---

## Convenciones de variantes

### Escala de énfasis por token

Cada grupo semántico tiene tres variantes:

| Sufijo | Uso | Contraste |
|---|---|---|
| (ninguno) | fill en charts, barras, iconos | ≥ 3:1 sobre fondo (WCAG UI) |
| `-bg` | fondo de badges, chips, highlights | claro, sin contraste requerido |
| `-txt` | texto sobre fondo blanco/claro | ≥ 4.5:1 (WCAG AA texto) |

### Regla de modo oscuro

Los tokens de dominio se redeclaran en `.dark {}`. Los componentes no necesitan lógica de dark mode — los tokens lo resuelven.

---

## Deductions — color por grupo

Los items en `deductions.ts` llevan un campo `color: string` que referencia un token de dominio:

| Grupo | Token |
|---|---|
| Seguridad Social | `--color-income` |
| Retención en la fuente | `--color-tax` |
| Primas / Cesantías / Vacaciones | `--color-provision` |
| Personalizadas | `--color-provision` (default) |

---

## Changelog

| Versión | Cambio |
|---|---|
| v1 | Tokens `--n-*` — nombres de color, no de propósito |
| v2 | Migración a `--color-{semantic}` — nombres de dominio |
