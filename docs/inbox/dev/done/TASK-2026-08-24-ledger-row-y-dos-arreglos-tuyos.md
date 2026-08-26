# TASK-2026-08-24 — la fila del ledger ya está en Figma, y dos cosas del código que hay que corregir

Dos componentes nuevos: **`LedgerEntryIcon`** y **`ledger-itemrow`** (el `LedgerRow` de
`CuentasView.tsx`). Con esto la página de cuenta deja de estar bloqueada por diseño.

- Figma: `Components · Icons & Avatar` → `doc: LedgerEntryIcon` · `Components · Rows` → `doc: ledger-itemrow`
- Paquete: `design-system/components/ledgerentryicon.html` y `ledger-itemrow.html`

## 1. Un fallo de accesibilidad, este sí urgente

El icono de seguridad social pinta el glifo con `--color-tax`. Ese nombre resuelve a
`bg/tax`, que es **amber/400**, y sobre `amber/50` mide **1.61:1**.

Un glifo relleno es un objeto gráfico: le aplica WCAG 1.4.11, que pide 3:1. No pasa.

**Cambio:** `--color-tax` → `--color-tax-txt` en `ENTRY_ICONS.ss.color`
(`CuentasView.tsx:32`). Eso es amber/700 y mide **4.84:1**.

Los otros cuatro tipos ya pasaban: income 3.58 · egreso 4.41 · transfer-in 6.16 ·
transfer-out 10.25 (Light; en Dark el suelo es 5.84).

## 2. Cuatro medidas donde Figma sigue a la familia de filas y el código no

Ninguna es invención de esta fila: son las medidas que ya usan `outcome-itemrow`,
`income-itemrow` y las demás. Si el código las cambia, las seis filas quedan iguales.

| dónde | código hoy | Figma |
|---|---|---|
| descripción | `ts-body-base` (16 Regular) | `Body/Base-Emphasis` (16 Medium) |
| saldo corrido | `text-[10px]` en crudo | `Amount/Micro` (12). **10 no es un peldaño de la escala** |
| botones de acción | `IconButton size="md"` | `Icon Button Size=LG` (36) |
| glifo del icono | `size={14}` | 16 (`icon-size/md`). **14 no es un peldaño de la escala de iconos** (12 · 16 · 20 · 24) |
| alto de fila | `min-h-[52px]` | 62, que sale del padding de la familia |

## 3. Dos cosas que la fila hace y conviene copiar

- **La columna del monto está fijada a 104.** Sin eso, un `+` delante mueve la columna
  entre filas vecinas, y un ledger se lee por el borde derecho.
- **El badge «Programado» nunca encoge; encoge la descripción.** Un badge truncado se lee
  como otra palabra. En Figma el tope de la descripción se calcula por variante con lo que
  queda después del icono, la columna del monto y las acciones de ESA variante.

## 4. Ejes de `ledger-itemrow`

`Device` (Desktop | Mobile) × `Flow` (Debit | Credit) × `State` (Default | Scheduled | Confirming).

Diez variantes, matriz **rala a propósito**: `Confirming` es sólo Desktop (en móvil se
confirma dentro del sheet) y **no hay `Pressed`**, aunque las filas hermanas sí lo tengan,
porque esta fila no tiene estilo de pressed en el código: el toque abre `RowActionsSheet`
y no pasa nada más.

El tipo de asiento (income · egreso · transfer-in · transfer-out · ss · scheduled) es un
swap anidado de `LedgerEntryIcon`, no un eje. Seis tipos por los ejes de arriba serían
sesenta variantes para un dato que el asiento ya trae.

## 5. Nada que hacer con los tokens

Ningún nombre publicado cambia. `ADDED 0 · CHANGED 0 · UNACCOUNTED 0`, y `validate-repo.mjs`
sale verde con `R1`–`R5`.

Un aviso, porque te afecta si regeneras: **`R2` ahora compara los 89 archivos que produce
`build.py`, no dos.** Comparaba `tokens.css` y `tokens.map.css` nada más, y por eso
`tokens/tokens.json` y `foundations/colors.html` llevaban tres commits atrasados sin que
nada lo dijera. Ya están al día. Si tu copia local del paquete está vieja, R2 te lo va a
decir ahora — con el nombre del archivo, no con un número.
