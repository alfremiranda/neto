# TASK-2026-09-02 — el flujo de cuentas: dos pantallas, confirmado por Alfredo

Confirmado. Lo de abajo está medido sobre `Flow - Accounts`, no sobre mis notas.

## Pantalla 1 · Cuentas (índice)

    body
      ├─ Header            Heading "Cuentas" + Button "Agregar cuenta"
      └─ accounts-grid     AccountCard × N, 220 × 120 cada una

| | Desktop `397:339` | Mobile `397:16453` |
|---|---|---|
| contenedor | `accounts-grid` — auto-layout horizontal, gap 12, **sin wrap**, clip | `accounts-scroller` — **GRID**, gap 12, 380 × 252 |
| tarjeta | `AccountCard` 220 × 120 | igual |

**El índice NO lleva `AccountSummaryCard` ni `LedgerContainer`.** Eso es lo único que cambia para
el usuario respecto a lo que publicaste: hoy elige una cuenta y ve todo junto; ahora entra y sale.

## Pantalla 2 · Cuenta (detalle)

    body
      ├─ breadcrumb            Levels=2 → "Cuentas › CMR Falabella"
      ├─ AccountSummaryCard    identidad + meta + métricas + divider + chart + chart-range
      └─ LedgerContainer       Rows (slot)

| | Desktop `397:359` | Mobile `397:16540` |
|---|---|---|
| breadcrumb | 201 × 24 | igual |
| AccountSummaryCard | 976 × 395 | 380 × 421 |
| LedgerContainer | 976 × 394 | 380 × 514 |

**El detalle NO lleva la grilla.** Y la gráfica vive **dentro** del `AccountSummaryCard`, no
suelta: `chart` y `chart-range` son hijos suyos, después del divider.

## El `breadcrumb` por fin tiene dónde vivir

`Levels=2`, `Cuentas › CMR Falabella`. Es la manera de volver al índice y era el componente sin
consumidor que venías señalando. El primer crumb navega; el segundo es la página actual.

## Lo que NO te estoy pidiendo

El **cómo** es tuyo y del orquestador. No hace falta router; puede ser un `ViewType` con el id de
la cuenta en el store, como quedó abierto en `TASK-…e §0.a`. Lo que confirmo es **qué ve el
usuario en cada pantalla**, que es lo único que era decisión de diseño.

## El argumento que cerró la decisión fue tuyo

Con siete cuentas, a 412 la grilla ocupa dos filas y empuja la tarjeta de resumen por debajo del
pliegue — lo mediste tú en `?preview`. Partir el flujo es lo que devuelve la gráfica a la primera
pantalla en un teléfono.

## Dos cosas del frame que ya no están atrasadas

- La papelera de la fila de saldo inicial: **corregida en el componente** `ledger-itemrow`
  (`State=Opening`), así que las instancias la heredan.
- El sidebar del frame (`Mes actual · Resumen anual · Configuración`) sigue siendo pintura vieja
  del mock. Ignóralo; el de la app es el bueno.

POINTER: Figma `396:16108` (flujo), `397:339` / `397:16453` (índice),
`397:359` / `397:16540` (detalle); design-system/components/breadcrumb.html,
accountsummarycard.html, ledgercontainer.html.
