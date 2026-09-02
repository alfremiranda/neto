# A-2026-09-02 — las tres del readout, construidas

Tu `A-2026-09-02-el-tooltip-de-datos` entró completo. Verificado en la app corriendo, a 1280 y
a 390 con táctil real, no en el source.

## 1. `Content` como intercambio, no otra burbuja

`TooltipReadout` + `ReadoutRow` existen y `KPIStrip` los usa. El ítem falso `{separator: true}`
—una entrada sin etiqueta y sin valor, en una lista de pares etiqueta/valor— desapareció: el
`Divider` es una propiedad de la fila que **abre** el grupo, como dijiste.

Una cosa que tu modelo no cubría y que resolví así: la burbuja de `TrendChart` **no puede colgar
de un trigger de Radix** — sigue al cursor sobre un SVG, así que se monta sola. Pero tenía que
*ser* esta burbuja. Exporté `TOOLTIP_SURFACE` desde `tooltip.tsx` y ambas la usan. Tu razón para
no bifurcar la burbuja era que la inversión quedaría definida en dos sitios; una burbuja hecha a
mano en la gráfica la habría definido en tres.

## 2. Los swatches

Los siete `readout/swatch/*` en uso. El mapa va por lo que la serie **significa**
(`oblig→tax`, `prov→provision`, `egres→expense`, `neto→net`), no por el token que la gráfica
usa: son dos superficies distintas y ese era todo el punto de tus medidas. La línea de la
gráfica no se tocó.

También entraron `fg/on-inverse-subtle` en la columna de etiqueta y `border/on-inverse` en el
filete, que es el `white/20` que yo tenía a mano y que en Dark habría dibujado blanco sobre
blanco.

## 3. Móvil, y una cosa que faltaba en el plan

Las cifras del punto seleccionado van a los `metrics` de `AccountSummaryCard`: el primero pasa de
`Saldo actual` a la fecha del punto y su valor. Hover y tap mueven lo mismo.

**Pero tu plan tenía un hueco que solo aparece al tocarlo.** Con `pointerup` limpiando la
selección —lo natural, y lo que hace un mouse— el tap la ponía y la quitaba en el mismo gesto:
el valor vivía lo que durara el dedo abajo. Eso es lo mismo que no responder.

Ahora **solo el mouse limpia al soltar.** En táctil el tap ES la selección y se queda, porque los
metrics son el único sitio donde esas cifras aparecen en un teléfono. `touch-action: pan-y` para
que la página siga desplazándose bajo un arrastre vertical.

## Lo que sigue sin construir, y por qué

`Series=Dual`. El saldo de una tarjeta ya es ≤ 0, así que graficarlo dibuja la deuda creciendo
hacia abajo. `Dual` propiamente necesita una **segunda cantidad** y el doc la nombra visualmente
—"la serie de deuda debajo"— pero nunca dice qué número es. En una gráfica de deuda no lo voy a
adivinar.

POINTER: src/components/ui/TooltipReadout.tsx, src/components/ui/tooltip.tsx (TOOLTIP_SURFACE),
src/components/cards/KPIStrip.tsx, src/components/annual/TrendChart.tsx,
src/components/cards/AccountChart.tsx (onSelect), AccountSummaryCard.tsx.
