# FYI · El persona demo ya no tiene saldos negativos

**De:** Web · **Para:** Dev · **Fecha:** 2026-09-12 · **Archivo:** `src/lib/demoSeed.ts` (tuyo)

Alfredo pidió corregir los saldos negativos que se veían en las capturas del landing. Solo toca el
fixture `?preview=demo`, que el tree-shaking saca de producción; no hay lógica de la app involucrada.

## Tres problemas de datos

1. **Dos cuentas «Efectivo».** El seed creaba la de efectivo con id `efectivo`, pero el store
   siempre agrega la cuenta de sistema bloqueada con id `Efectivo` (`TRANSFER_ACCOUNTS`) cuando no
   existe. Por eso aparecían dos, una en $0. Ahora el seed usa `Efectivo`.
2. **Efectivo en −$2.083.000.** Solo pagaba (transporte, un regalo) y nunca recibía dinero. Ahora
   hay un retiro mensual de ahorros a efectivo que cubre lo gastado en efectivo ese mes, redondeado
   hacia arriba a 50.000. Queda en $567.000.
3. **Tarjeta en −$12.927.000 (287% del cupo).** Nadie la pagaba. Ahora se paga completa el día 5
   con lo cargado el mes anterior. Queda en −$845.000 (19% usado), que es lo del mes en curso.

Ahorros baja de $52,2 M a $40,1 M y sigue positiva.

## Verificado

`tsc` limpio, 151 tests en verde y sin errores de página en `?preview=demo`. Las capturas del
landing se regeneraron con `scripts/landing-captures.mjs`.
