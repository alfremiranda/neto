# Q-2026-09-02 — el flujo son dos pantallas y yo construí una

Alfredo me mandó a mirar `Page - Accounts` (`396:16108`) y a confirmarlo contigo. Lo hice sobre
el archivo, no sobre tus notas.

## Lo que dice el flujo

Dos pantallas unidas por una flecha, en escritorio y en móvil:

    Cuentas (índice)          →   Cuenta (detalle)
    header + accounts-grid        breadcrumb + AccountSummaryCard + LedgerContainer

El índice **no lleva ni tarjeta de resumen ni ledger**. El detalle **no lleva la grilla de
cuentas**, y abre con un `breadcrumb` — `Cuentas › CMR Falabella`.

**Yo construí una sola pantalla:** la grilla arriba, y debajo el resumen y el ledger de la cuenta
que `selectedId` tenga seleccionada. Funciona, pero no es esto.

Tú misma lo dejaste abierto en `TASK-…e §0.a` — "puede ser un `ViewType` nuevo con el id de la
cuenta en el store; es decisión tuya y del orquestador". Lo pregunto ahora porque el `breadcrumb`
existe como componente y no tiene consumidor, que suele querer decir que falta la pantalla donde
vive.

**Lo que necesito de ti no es el cómo** —eso es mío y del orquestador, y no hace falta router—
sino confirmar que el índice **debe perder** el resumen y el ledger. Es lo único que cambia para
el usuario: hoy elige una cuenta y ve todo junto; con el flujo, entra y sale.

Un argumento a favor de tu versión que no está escrito: con siete cuentas, la grilla ocupa dos
filas y empuja la gráfica fuera de la primera pantalla en móvil. Medido en `?preview`: a 412 la
tarjeta de resumen arranca por debajo del pliegue.

## Dos cosas del frame que van ATRASADAS respecto a tus propias respuestas

No las toco, pero deberías saber que el frame se contradice con lo que ya me contestaste:

1. **Las métricas.** `397:359` muestra la cadena corrida en la meta —
   `1234   16% usado · Corte 4 · Pago 20`— y solo dos métricas arriba a la derecha (Deuda, Cupo).
   Pero en `A-2026-09-02` me dijiste que las **métricas discretas son correctas** y que la
   anatomía `metrics / metric` dice pares. Construí pares. El frame es el estado anterior.
2. **La papelera del saldo inicial.** La fila `Deuda inicial` del frame lleva lápiz **y**
   papelera. En `A-2026-09-02 Q3` confirmaste **sin papelera**. Construí sin papelera.

También: el sidebar del frame dice `Mes actual · Resumen anual · Cuentas · Configuración`, que no
es el de la app (`Resumen · Mes · Cuentas · Ahorros`). Probablemente pintura vieja del mock.

## Y una cosa que sí me falta, sin discusión

El `breadcrumb`. Existe en el DS, está en las dos pantallas del flujo y no lo he montado en
ninguna parte. Si el índice se queda como está, sigue faltando; si el flujo se parte, es la
manera de volver.

POINTER: Figma `396:16108`, `397:359` (desktop), `397:16540` (mobile);
src/components/views/CuentasView.tsx; design-system/components/breadcrumb.html.
