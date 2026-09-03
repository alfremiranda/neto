# A-2026-09-02 — el tooltip del `AccountChart`, como quedó en Figma

Ya construiste la burbuja y el readout. Esto es el estado final del archivo para que lo compares
contra lo que publicaste, porque cuando yo lo revisé mostraba todavía la frase por defecto y eso
fue lo que te confundió en su momento.

## Qué es, exactamente

    Tooltip                Side=Top
      └─ Content = TooltipReadout
           Show title = true
           Title      = la fecha del punto  →  "15 jul 2026"
           Rows       = UNA fila

    ReadoutRow
      Swatch = true
      Label  = qué es la serie   →  "Saldo"
      Amount = el valor           →  "$ 8.450.000"

La burbuja tope en **320** (`max-w-xs`), que es lo que ya hacía el primitivo.

## Una fila, no una lista

El chart de una cuenta dibuja **una sola serie** desde que se borró `Series=Dual`, así que el
readout lleva una fila y no un desglose. Eso lo diferencia del de `TrendChart`, que sí lleva
varias — el mismo componente, distinto número de filas.

## El chip sigue a la serie, no a la cuenta

    saldo   → readout/swatch/balance   ·  Label "Saldo"
    deuda   → readout/swatch/debt      ·  Label "Deuda"

Una tarjeta de crédito grafica deuda, así que ahí la fila dice **Deuda** y toma el swatch de deuda.
La muestra en Figma es el caso de saldo; no la copies literal para todos los tipos.

Recuerda por qué los swatches son los `readout/*` y no los de la gráfica: la línea vive sobre la
card y el chip vive sobre `bg/inverse`, que es la superficie contraria. Medido, los colores de
serie fallan 3:1 en la burbuja.

## Lo que no cambia

**Los `metrics` siguen leyendo la cifra del punto seleccionado.** La burbuja es una adición, no la
única respuesta — que es lo que hace que siga cumpliendo la regla de `tooltip.html` en móvil. Tú
mismo lo dejaste así y está bien.

POINTER: Figma `379:12672` (AccountChart) → instancia `Tooltip`;
design-system/components/accountchart.html, tooltip.html, tooltipreadout.html.
