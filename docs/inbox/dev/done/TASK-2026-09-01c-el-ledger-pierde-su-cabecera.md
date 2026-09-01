# TASK-2026-09-01c — el ledger pierde su cabecera, y Entradas/Salidas no deben existir así

Reemplaza el diseño que te pasé en `FYI-2026-09-01b`. El contenedor cambió el mismo día,
después de verlo en la pantalla real.

## 1. El header del ledger se va entero

De sus seis cosas, **cuatro ya estaban en la tarjeta de arriba**: nombre de la cuenta, botón de
editar, `16% usado · Corte 4 · Pago 20`, y la deuda actual. De las dos que no se repetían,
Alfredo cortó las dos:

- **El conteo de movimientos** es ruido sobre una lista que se ve.
- **Entradas y Salidas** — ver el punto 2, que es un bug tuyo, no sólo del mock.

En código: el bloque `{/* Header */}` de la tarjeta del ledger en `CuentasView.tsx` desaparece.
La tarjeta arranca directamente con los movimientos.

## 2. Entradas / Salidas: no las pongas todavía

Hoy en `CuentasView.tsx`:

```ts
const totalCredits = ledger.filter(e => !e.scheduled && e.convertedAmount > 0).reduce(...)
const totalDebits  = ledger.filter(e => !e.scheduled && e.convertedAmount < 0).reduce(...)
```

`ledger` es `buildLedger(...)`, que recorre **todos los meses de la base**. Así que esas dos
cifras son un acumulado **histórico completo**, sin etiqueta de periodo, y están dibujadas
**justo debajo de una gráfica que dice "Últimos 30 días"**.

Dos escalas de tiempo distintas en la misma pantalla, y ninguna de las dos lo dice. Alfredo lo
señaló así: *"no me queda claro, es una sumatoria o resta de todo lo que ingresa y sale, y si no
tiene un control de fechas o algo no tiene sentido"*. Tiene razón — una cifra cuyo periodo es
invisible es peor que ninguna cifra, porque invita a una comparación que no se sostiene.

**Fuera por ahora.** Cuando vuelvan, tienen que traer su periodo escrito al lado.

## 3. El saldo inicial deja de ser una tira y pasa a ser una fila

Antes era una franja con su propio fondo encima de la lista. Ahora es **una fila del ledger**:
`ledger-itemrow` con `State=Opening`, la **última** de la lista, porque el ledger va de más
nuevo a más viejo.

Toma las mismas reglas, el mismo riel izquierdo y el mismo borde derecho que los movimientos que
explica, así que la tarjeta se lee como **una sola tabla** en vez de una tabla con tapa.

Esa fila:
- no lleva ícono de tipo ni acciones — en su lugar van dos huecos del mismo ancho, para que la
  columna izquierda y la del importe sigan alineadas;
- no lleva fecha ni saldo corrido: **en la apertura, el importe ES el saldo**.

En código eso es el bloque `{/* Starting balance row */}`: sale de donde está (entre el header y
las transacciones, con `bg-muted/50`) y entra al final del `map` de `ledgerDesc`, con la misma
estructura de fila.

## 4. El contenedor quedó sin ejes

Al irse la cabecera, `Balance=Deuda|Saldo` se quedó sin nada que cambiar (existía para el título
y su color) y `Device` también (existía para ocultar Entradas/Salidas en móvil). De cuatro
variantes pasó a **un solo componente**: la tarjeta con borde y radio, y una ranura que sólo
acepta `ledger-itemrow`. `Device` vive entero en las filas.

`R1`–`R5` verde. Figma: `C1` 0 · `C2` 0 · `C3` 0 · `C4` 0 · `C8` 0 sobre lo nuevo.
