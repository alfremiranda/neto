# A-2026-09-02 — el tooltip de datos: decidido, y con componentes

Tenías razón en las tres. Va lo que quedó construido en Figma, con los números que lo
decidieron.

## §5a — no era empate, y `TrendChart` migra

Cinco contra uno. `--popover` es el idioma de **Popover**, que es otro objeto (panel anclado,
288px, solo desktop). El tooltip de gráfica es **Tooltip**, invertido. Migra `TrendChart`.

## 1. El readout no es otra burbuja, es otro contenido

Solo cambia lo de adentro: la superficie, la flecha, la inversión y el tope son el mismo objeto.
Así que **`Tooltip` ahora tiene `Content`, un instance-swap igual al de `Sheet`**:

| componente | nodo | qué es |
|---|---|---|
| `TooltipText` | `980:274` | la frase corta — es el default de `Content` |
| `TooltipReadout` | `980:276` | `Title` + `Show title` + slot `Rows` |
| `ReadoutRow` | `980:273` | `Label` · `Amount` · `Swatch` × `Divider` × `State` |

Partir la burbuja habría dejado la inversión definida en dos sitios.

**Un cambio en tu modelo de datos:** `Divider` dibuja la línea **arriba** de la fila. Así el
límite de grupo es una propiedad de la fila que abre el grupo, y desaparece el ítem falso
`{separator: true}` que hoy usa `KPITooltipContent`.

`Tooltip` quedó topado en **320** (`max-w-xs`), que es lo que ya hacía el primitivo.

## 2. Los chips no pueden seguir el modo — medido

`bg/inverse` es slate/900 en Light y **blanco** en Dark. Un chip que tomara el color de serie del
modo actual se pinta sobre la superficie contra la que **no** fue elegido. Contra `bg/inverse`:

| serie | Light | Dark |
|---|---|---|
| tax | 10.69 | **1.44** |
| expense | 4.74 | **2.77** |
| net | 3.33 | **2.43** |
| provision | 4.74 | **1.92** |
| income | **2.66** | **1.80** |

Las cinco fallan 3:1 en Dark; `income` también en Light. Por eso `readout/swatch/*` es **un solo
peldaño por serie que pasa 3:1 en las dos superficies**, con el **mismo valor en Light y Dark**:

    readout/swatch/tax        amber/700    5.02 / 3.56
    readout/swatch/expense    red/500      3.76 / 4.74
    readout/swatch/net        cyan/600     3.68 / 4.85
    readout/swatch/provision  emerald/600  3.77 / 4.74
    readout/swatch/income     blue/500     3.68 / 4.85
    readout/swatch/balance    cyan/600     3.68 / 4.85
    readout/swatch/debt       rose/600     4.70 / 3.80

La línea de la gráfica **no cambia**: esa vive sobre la card, no sobre el tooltip, y conserva su
par de modos. Un trabajo por token.

`tax` es el cuarto fallo de amber/400 en dos días (glifo ss 1.61, punto de cuenta 2.91, relleno
de Progress 1.52, ahora 1.44). Es un problema de peldaño, no cuatro problemas de sitio.

**Dos tokens nuevos más**, porque los estabas inventando a mano:

- `fg/on-inverse-subtle` — la columna de etiqueta. 9.1:1 Light, 4.76:1 Dark.
- `border/on-inverse` — el filete. Tu `white/20` fijo habría dibujado una línea **blanca sobre la
  superficie blanca** de Dark.

## 3. Móvil sí recibe los datos, y no como tooltip

Tienes razón: `mousemove`/`mouseleave` y nada más. Pero la respuesta no es un tooltip táctil.

**Las cifras del punto seleccionado van a los `metrics` de `AccountSummaryCard`**, que ya existen
y ya abren con "Saldo actual". Hover en desktop y tap en móvil hacen lo mismo — mover la
selección — y la card la lee. Es como se comportan las apps de bolsa de la referencia que dio
Alfredo para `chart-range`. La burbuja flotante queda como azúcar de desktop encima de un readout
que siempre está visible.

`AccountChart` y `chart-range` quedan desbloqueados.

## Sigue pendiente de Alfredo

`1S` vs `7D`, y `YTD` vs `Año`.

POINTER: Figma `326:71` (Tooltip · Content), `980:276`, `980:273`, `980:274`;
design-system/docs/10-account-page.md §5a; design-system/components/tooltip.html;
design-system/tokens/tokens.json (9 tokens nuevos, `emit-tokens.mjs` ADDED: 9).
