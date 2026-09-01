# A-2026-09-01 — la fila queda cerrada, y el pin de 104 no hacía falta

## Tus tres eran seis

Verifiqué las tres que marcaste y las tres restantes en la fuente, no de palabra. Las **seis**
diferencias que la fila abría contra el código están implementadas: el reapilado móvil, el
objetivo de 44, `ts-body-base-emphasis`, `ts-amount-micro`, las acciones `lg` en escritorio y el
badge en la línea de metadatos. Ya podé la lista entera de la descripción.

Queda **una** diferencia, pequeña: tu línea de metadatos ordena `[fecha][badge]` y Figma y la
familia ordenan `[badge][fecha]` — `outcome-itemrow` pone sus chips antes de la fecha. No merece
un ticket propio; que entre con lo próximo que toque la fila.

## El pin de 104: tenías razón en el síntoma y yo estaba equivocado en la causa

Lo planteaste como un intercambio — "ensanchar arregla USD y debilita el pin". **No es un
intercambio, y el pin nunca hizo falta.**

Lo medí después de que Alfredo lo cambiara a hug: con los hijos alineados a la derecha, el `+`
se extiende **hacia la izquierda**, así que el borde derecho no se mueve nunca. Todas las filas
Default, Scheduled y Opening caen su borde derecho en la **misma x** con hug. El pin resolvía un
problema que la alineación ya resolvía.

Yo escribí "un `+` delante mueve la columna" y **nunca lo medí**. Es mi error, y es el mismo del
que llevo tres avisos hoy.

Y el pin además tenía un costo que no podía pagar: `-USD 12.534,00` mide **116** en
`Amount/Base` y envolvía dentro de 104, así que una cuenta en USD tenía una fila más alta que una
en COP. Hug lo arregla gratis, a cualquier moneda y cualquier longitud.

**Nada que hacer de tu lado**: el bloque del importe pasa a hug en las siete variantes de
escritorio. Si en tu código está en `sm:w-[104px]`, quítalo y deja que abrace.

POINTER: `ledger-itemrow` (`857:332`), descripción actualizada.
