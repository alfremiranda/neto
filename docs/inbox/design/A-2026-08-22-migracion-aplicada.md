# A-2026-08-22 — Migración aplicada. Casi todo ya había llegado con el exportador.

Cierra `TASK-2026-08-20-migracion-de-tokens`.

## Medido antes de tocar nada

De los 138 nombres del mapa, **`src/` usa cero**: `rename` 114, `merged` 11, `removed` 13, y
ninguno aparece en el código. La app consume los nombres del **puente** (`--card`, `--primary`,
`--color-income`), no los semánticos, así que el renombre lo absorbió `tokens.map.css` entero.

Y los cambios de valor **ya estaban servidos**: `--fg-income` ya resuelve a `#1d4ed8`. Llegaron
cuando corrió el exportador, no hacía falta tocar `src/`.

Así que de las tres cosas que no eran renombres, dos ya estaban:

| | estado |
|---|---|
| `--fg-income` de cian a azul | ya servido por el puente |
| eyebrow `PASO N DE 3` sin color de marca | ya en `fg/subtle` desde la entrega 2 |
| **neto negativo en `--fg-expense`** | ← lo único que faltaba |

## Lo que cambié

`KPIStrip` ya condicionaba por signo, pero pintaba con **danger**, no con expense. Corregido.
Verificado forzando un neto negativo en el fixture: `rgb(185,28,28)` = `--color-expense-txt`.

En `AnnualTable` **no** puse el condicional, a propósito: `totNeto` limita cada mes a cero antes
de sumar, así que el acumulado no puede salir negativo y el condicional sería código muerto.
Dejé la razón escrita al lado.

## Dos cosas que encontré y no decido yo

**1 · Un neto negativo muestra `$0`.** El valor va envuelto en `Math.max(neto, 0)`, así que el
número dice cero y el color dice rojo. La persona ve "$0" en rojo en vez de cuánto le falta.
Es anterior a esta migración y no lo toqué. Si el signo carga el significado —que es el
argumento del propio cambio— entonces ocultar la cifra contradice el cambio.

**2 · El mismo `Math.max` en el resumen anual** hace que un mes negativo desaparezca dentro de un
año positivo. Mismo origen, misma pregunta.

Ambas son decisiones de producto de Alfredo, no de nomenclatura.

## Sobre tu pregunta de nombres incómodos

Ninguno. `bg/` · `fg/` · `border/` · `shadow/` al frente se lee mejor desde código que desde
Figma, porque en CSS la propiedad ya está a la vista y el nombre ahora concuerda con ella en vez
de contradecirla. El check que propusiste —un `--fg-*` en un `border-color`— sigue siendo el que
más paga, y lo tengo anotado como `R6` para cuando el vocabulario esté aplicado en toda la app.
