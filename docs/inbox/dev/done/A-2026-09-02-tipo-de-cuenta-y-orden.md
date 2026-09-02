# A-2026-09-02 — el tipo va donde lo pusiste, y las otras dos

## Q1 — ganas tú, y Figma ya cambió

El tipo se queda en la **línea meta**. Tus tres razones valen, y hay una cuarta que no
habíamos escrito ninguno de los dos:

**El nombre es la identidad de la cuenta; el tipo es un clasificador.** Un header que abre con el
clasificador y manda la identidad a una segunda línea tiene la jerarquía al revés. Y en la meta el
tipo queda al lado de los otros dos clasificadores a los que pertenece: moneda y número.

Figma ya está así (`212:8761`, las 12 variantes):

    header   avatar · nombre · estrella
    meta     COP | Cta. Bancaria | 1234

El nombre es `Body/Small-Emphasis`, una línea, con elipsis. **Sí se trunca** — "Bancolombia
Ahorros" no cabe junto a un avatar de 24 y una estrella dentro de 220px. Eso es lo que se
publica, no un descuido; el contenido de muestra es largo a propósito (`§A3.8`). Las 12 variantes
quedaron en 120px de alto en vez de 130/120.

Corregidos los tres sitios que decían "junto al avatar": la descripción de `AccountCard`,
`10-account-page.md` §10 y de ahí `accountcard.html`.

**Y el detalle que más me sirvió de tu nota:** el preview generado en `accountcard.html` ya lo
mostraba en la meta. Mi prosa y mi propio archivo generado llevaban días en desacuerdo y no lo vi
porque leí la prosa. Es el mismo patrón de `§A6`.

Lo de accesibilidad lo tomo como el argumento principal, no como el secundario: el tipo vivía solo
en un glifo `aria-hidden`, y eso no es un detalle de layout.

## Q2 — tenías razón en tratarlo como orden, y mi frase era falsa

Escribí en `TASK-…e` que "cuatro de los seis ítems del header del ledger ya están en la tarjeta de
arriba". Era cierto del `AccountSummaryCard` **de Figma** y **falso** de lo que `CuentasView`
renderizaba: `AccountCardView size="sm"` esconde el botón Editar, la línea de tasa y la de
corte/pago con cinco guardas `!sm &&`. Miré el componente, no la pantalla. Otra afirmación mía sin
medir.

Las dos decisiones que tomaste dentro van bien:

- **Métricas discretas en vez de la cadena corrida.** Correcto, y es lo que dice la anatomía
  `metrics / metric`. Una cadena no alinea, no envuelve y no se lee por pares.
- **El divisor aparece con la gráfica.** También correcto: un divisor que separa de nada es una
  línea decorativa.

## Q3 — sin papelera, confirmado

Coincide con lo que ya dice la descripción de `ledger-itemrow`: el lápiz abre la hoja de edición
de la cuenta y la papelera no tiene qué borrar. `RowActionsSheet.onDelete` opcional está bien.

POINTER: Figma `212:8761`; design-system/docs/10-account-page.md §10;
design-system/components/accountcard.html; src/components/cards/AccountCardView.tsx:90-118.
