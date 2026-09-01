# FYI-2026-09-01 — la fila del ledger cambió de forma, y las pantallas de cuenta ya la usan

Actualiza `TASK-2026-09-01`, no lo reemplaza: el fallo de contraste del glifo `ss` sigue igual
de urgente y sigue siendo el punto 1 de ese archivo.

Las dos pantallas de cuenta en Figma (`Desktop · 2 · Cuenta (detalle)` y `Mobile · 2 ·
Cuenta (detalle)`) ya no llevan `income-itemrow`: llevan `ledger-itemrow`.

Al ponerla en la pantalla real aparecieron **tres cosas que la fila tenía mal**. Las tres las
había resuelto ya la familia de filas; yo no la había mirado lo suficiente.

## 1. El badge «Programado» va en la línea de metadatos, no al lado de la descripción

Lo tenía al lado del texto, con un tope de ancho en la descripción para que el badge nunca
encogiera. **Ese tope no puede funcionar:** `maxWidth` es una de las pocas propiedades que
Figma NO deja sobrescribir por instancia, así que un tope calculado para una fila de 603
seguía truncando a 942, que es el ancho al que la página de cuenta la usa de verdad.

`outcome-itemrow` ya lo tenía resuelto: descripción sola en su línea, `FILL`, truncando, sin
tope; los badges y la fecha debajo como chips que abrazan su contenido. Se adapta a cualquier
ancho porque no hay nada fijado.

**En código:** el badge sale de la línea del título y baja a la línea de la fecha.

## 2. Móvil se reapila en tres líneas

A los **346px** que le da la página de cuenta, la forma de una sola línea tiene que meter
descripción, fecha, columna de monto de 104, el icono y una acción. **No cabe** — algo se
trunca siempre. Apilar le da al texto el ancho completo.

Orden en móvil: **montos · descripción · metadatos**. Escritorio se queda en una línea.

**En código:** hoy `LedgerRow` renderiza el mismo flex row a cualquier ancho.

## 3. La acción en móvil es de 44px

`Icon Button Size=XL`, no `LG`. 44 es el objetivo táctil de **WCAG 2.5.5** y es lo que usan
las filas hermanas en móvil. Escritorio se queda en `LG` (36), donde hay puntero.

**En código:** `size="icon-sm"` en el botón de `MoreVertical`.

---

## Lo demás de la pantalla

Además de las filas cambié en las dos pantallas, y lo digo porque no me lo pediste:

- El pie del contenedor decía `Saldo actual · $43.361.749 · USD 12.534,00 · TRM hoy 3.459,53`.
  Esa cuenta es **CMR Falabella, una tarjeta de crédito**, no una cuenta en USD. Ahora dice
  `Deuda actual · $1.284.500 · Cupo $8.000.000 · 16% usado`.
- La `AccountSummaryCard` decía `Deuda -$0.00`, `Cupo $0.00`, `0% usado`. Con un ledger real
  debajo, la pantalla se contradecía a sí misma. Ahora concuerda.
- Los cinco movimientos **cuadran**: `1.569.700 +329.900 = 1.899.600 −800.000 = 1.099.600
  +184.900 = 1.284.500`, y el programado **no mueve el saldo**, que es justo la regla que la
  fila documenta. Si el contenido de ejemplo no cuadra, no sirve para revisar nada.

Sigue abierto y **no** lo toqué: el tooltip y las marcas del eje del gráfico dicen julio
(`1/7`…`13 Jul 2026`) mientras el topnav dice `Jue, 18 jun`. Ya estaba así.

El paquete está regenerado, `R1`–`R5` verde y ningún nombre de token cambia.
