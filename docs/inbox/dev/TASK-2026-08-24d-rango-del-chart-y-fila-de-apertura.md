# TASK-2026-08-24d — selector de rango en el chart, y la fila de apertura completa

Dos cosas nuevas en la página de cuenta. La primera **no existe en tu código todavía**: el chart
de la página de cuenta sólo vive en Figma (`AccountChart` / `AccountSummaryCard`); en `src/` los
únicos charts son los anuales.

## 1. `chart-range` — el rango de fechas del chart

Una tira de pills bajo el chart: `1D · 1S · 1M · 3M · YTD · 1A · 5A`, el patrón de las apps de
bolsa. **Compone instancias de `Segment`**, no acuña una pill nueva: `Segment` ya tiene los tres
estados y una propiedad de texto, y su propia descripción dice que un segmento suelto no es un
control. Es la misma relación que `tab-navigation` tiene con `Tab`.

### La regla que importa

**Un rango se dibuja sólo si la cuenta tiene al menos un movimiento ANTERIOR a su inicio.**

Si no, esa pill dibuja exactamente la misma línea que la pill más corta de al lado — y un control
que no puede cambiar lo que ves no es una opción, es una promesa que el dato no cumple. Decisión
de Alfredo, y es lo que permite ofrecer las siete sin mentir.

Dos de las siete piden algo que **el modelo no garantiza**: `date` es **opcional** en `Income`
(`src/types`), así que una cuenta cuyos movimientos sólo traen mes no tiene serie diaria y `1D` y
`1S` no se pueden dibujar para ella. `5A` espera igual: la app es más joven que cinco años.

Así que la tira es de **longitud variable**, como ya lo son `tab-navigation` y `action-chip`.

### De copy, sin decidir

`1S` para semana (la referencia usa `1W`; `7D` sería menos ambiguo en español) y `YTD` como
acrónimo. Las dos son tuyas/de Alfredo, no mías.

### Un efecto secundario

`AccountChart` **perdió su etiqueta fija "Últimos 30 días"**. La tira ya dice el rango y el eje ya
imprime las fechas; una etiqueta fija se habría contradicho con el control de al lado en cuanto
alguien tocara `1A`.

## 2. La fila de saldo inicial ya lleva icono y acciones

Corrige lo que te pasé en `TASK-2026-08-24c`. La fila `State=Opening` **no** va con huecos en
blanco: lleva su propia marca y las mismas acciones que las demás.

- **Marca**: `LedgerEntryIcon` gana un séptimo tipo, `Type=opening` — glifo `wallet` sobre el
  tinte neutro. Wallet porque es la cuenta misma y no algo que le pasó; neutro porque los cinco
  colores de movimiento significan una dirección y esto no tiene ninguna. Evita a propósito
  `landmark` (que ya usa `Icon Account` para cuenta bancaria) y las dos flechas, el reloj y el
  escudo, que están tomados.
- **Acciones**: las mismas que cualquier fila.

### Y aquí una que hay que decidir, no diseñar

**"Eliminar" no tiene a qué apuntar en esta fila.** El saldo inicial es un **campo de la cuenta**
(`Account.startingBalance`), no un asiento del ledger. El lápiz debería abrir el sheet de editar
cuenta; la papelera no tiene nada que borrar — vaciarlo es poner el campo en `null`, que es una
edición.

O la papelera no va en esta fila, o significa "borrar el saldo inicial". Es decisión de producto.

`R1`–`R5` verde. Figma: `C1` 0 · `C2` 0 · `C3` 0 · `C8` 0 sobre lo nuevo.
