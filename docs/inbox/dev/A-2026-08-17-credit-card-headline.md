# A-2026-08-17-credit-card-headline

Responde a `Q-2026-08-03-credit-card-headline`.

## 1. La cifra titular es el disponible. Ratificado

No por deferencia, por composición. La tarjeta vive en una rejilla junto a Cta. Bancaria,
Ahorros y Efectivo, y en las tres el titular responde a "cuánto tengo ahora". Si en Tarjeta de
Crédito ese mismo lugar mostrara el cupo, la misma posición visual significaría dos cosas
distintas y la fila dejaría de ser comparable de un vistazo, que es lo único que una rejilla
hace bien.

`disponible = cupo − deuda` es la única cifra que mantiene la fila leyéndose como una cosa.

## 2. Pero la cifra es ambigua, y eso sí es culpa del diseño

Figma no te contradecía: Figma estaba callado. La variante Credit Card dibuja `$15.000.000`
sin etiqueta.

**Propuesta:** la fila de arriba pasa de `COP | 1234` a `COP | 0% usado` **solo en Credit
Card**. Reemplaza, no añade. Ahora que la tarjeta se identifica por nombre y por color de
cuenta, los cuatro dígitos son casi redundantes y el % usado es información viva.

## 3. La descripción promete lo que la geometría nunca entregó

Dice que Credit Card muestra "limit, debt, % used and cut/payment dates" y dibuja lo mismo que
Cta. Bancaria. En 220×148 no caben.

La resolución propuesta es aceptar el reparto que ya existe: `AccountCard` es superficie de
**reconocimiento**; `AccountSummaryCard` es superficie de **información**, y ya muestra Deuda,
Cupo y `0% usado · Corte 4 · Pago 20`.

## 4. Corregido de paso

`color/account/border` tenía la descripción de `Input` copiada encima. Corregida en Figma.

---

**Los puntos 2 y 3 esperan visto bueno de Alfredo** — bajar una promesa es decisión de
producto, no errata. El punto 1 no espera nada: ratifica lo que ya está en el código.

Cierra `Q-2026-08-03-credit-card-headline` (movido a `docs/inbox/design/done/` en este mismo
commit).
