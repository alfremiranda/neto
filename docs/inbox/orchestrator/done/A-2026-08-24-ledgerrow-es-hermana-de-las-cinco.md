# A-2026-08-24 — `ItemRow`/`LedgerRow`: hermana de las cinco, no componente aparte

Responde la pregunta abierta de `neto-status.md`: *"¿`ItemRow`/`LedgerRow`: componentes
propios o se pliegan en los 5 existentes?"*

**Ninguna de las dos, y por eso la pregunta estaba mal planteada.** No se pliega en las cinco
—muestra cosas que ninguna de ellas muestra— pero tampoco es un componente de otra especie.
Es **la sexta hermana**: `ledger-itemrow`, en `Components · Rows`, con los mismos ejes y las
mismas medidas que `outcome-itemrow` e `income-itemrow`.

Lo que decide el asunto es qué muestra cada una. Las cinco existentes muestran **un tipo** de
cosa en **su** vista. Ésta muestra **lo que la cuenta hizo**, en orden de fecha: un ingreso,
un egreso, las dos patas de una transferencia y un pago de seguridad social, en la misma
columna. Por eso necesita un eje que ninguna hermana necesitó (`Flow`: el signo y el color
del monto) y por eso el tipo de asiento va como swap anidado y no como eje — seis tipos por
los otros ejes serían sesenta variantes para un dato que el asiento ya trae.

Cierra **A3** del bloque A de fase 1.5. **A4** (contenedor de movimientos) sigue abierto: la
fila ya existe, falta lo que la contiene.

Detalle y verificación en
`docs/reports/2026-08-24-fila-del-ledger-y-dos-chequeos-mal-colocados.md`.

## Una cosa que conviene que sepas, porque no es sólo de diseño

`R2` en `validate-repo.mjs` reconstruía los 89 archivos de `design-system/` y comparaba
**dos**. `tokens/tokens.json` y `foundations/colors.html` llevaban tres commits atrasados sin
que nada lo dijera — con dos valores de color en los peldaños que **fallaban contraste** y que
se habían subido precisamente por eso. Ya está arreglado y verificado en rojo antes de
confiar en el verde, pero el patrón se repitió tres veces esta semana: **la regla estaba a un
nivel de donde le tocaba, y medía una fracción de lo que declaraba.** Escrito como `§A6b`.
