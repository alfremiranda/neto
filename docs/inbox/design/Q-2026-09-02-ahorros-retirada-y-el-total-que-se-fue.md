# Q-2026-09-02 — Ahorros retirada, y una cifra que se quedó sin casa

`TASK-2026-09-02` §1 hecho: la página de Ahorros ya no existe. Las cuentas de ahorro y los CDT
viven en Cuentas como cualquier otra, con `AccountCard`, y sus cifras propias —vencimiento,
tasa— son métricas del `AccountSummaryCard` en la página de la cuenta.

Dos decisiones que tuve que tomar porque el ticket retiraba la página sin decir a dónde iba lo
que vivía en ella. Ninguna es de diseño puro, así que las dejo escritas para que las mires.

## 1. La tarjeta de reserva se fue a Resumen, no al Mes

La retención es un saldo que corre **todo el año**. Tú misma lo argumentaste cuando la ubicaste:
"es un saldo que corre todo el año, no un dato de septiembre". Con Ahorros retirada, el único
sitio donde eso sigue siendo cierto es la vista anual — ponerla en el Mes habría hecho que una
brecha del año se leyera como un hecho de septiembre.

Está entre la tabla anual y la gráfica de tendencia. Si prefieres otro orden dentro de Resumen,
dime y la muevo; el sitio lo elegí yo.

## 2. "Total ahorrado" NO tiene reemplazo, y creo que se perdió algo

Ahorros abría con **Total ahorrado**: la suma de todas las cuentas de ahorro convertida a la
moneda principal. Con la página retirada esa cifra no existe en ningún lado.

No la reubiqué porque no sé si la quieres. El argumento en contra es el tuyo: si el tipo de
cuenta deja de ser la idea organizadora, un total *por tipo* la reintroduce por la puerta de
atrás. El argumento a favor es que "cuánto llevo apartado" es una pregunta distinta de "cuánto
hay en esta cuenta", y la grilla de Cuentas no la responde — obliga a sumar de cabeza.

Tres salidas: vuelve como métrica en Resumen; vuelve como una fila de total en la grilla de
Cuentas; o se queda fuera a propósito. **Es tuya y de Alfredo.**

## Lo demás

`SavingsCard` no lo toqué: en código nunca existió como componente propio, así que el paso a
legacy es un cambio del archivo de Figma y del paquete, no del repo. Lo que sí revisé es que no
quedara ninguna referencia huérfana — no queda.

Un detalle que solo aparece pensando en quien ya usa la app: `uiStore` persiste la vista, así que
alguien cuya última visita fue Ahorros habría abierto en un área principal en blanco. El `merge`
de la persistencia ahora la reasigna a Cuentas. Verificado con esa vista guardada a mano, en 390
y 1280.

POINTER: src/components/views/DashboardView.tsx (ReservaCard), src/store/uiStore.ts (merge),
src/types/index.ts (ViewType).
