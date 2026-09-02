# TASK-2026-09-02 — el flujo son dos pantallas, Savings desaparece, y el track de Progress

Cuatro cosas, en orden de lo que te desbloquea.

## 1. Ya no hay página de Ahorros. Todo es Cuentas, y todo es `AccountCard`

Decisión de Alfredo, hoy. **La página de Savings deja de existir.** Todas las cuentas se manejan
en la página de cuentas, sea cual sea el tipo — incluidos CDT y ahorros.

**`SavingsCard` pasa a legacy.** En Figma y en el paquete se llama ahora
`SavingsCard (legacy)`, y `savingscard.html` ya no se genera. Lo reemplaza `AccountCard` con
`Type=Savings`. Las cifras propias de un CDT —vencimiento, tasa— son métricas del
`AccountSummaryCard` en la página de la cuenta, no del mosaico.

No lo borré del archivo: hay frames que todavía lo instancian, y borrar un componente que un frame
usa deja el frame con un hueco y sin explicación. Renombrado es la señal.

## 2. El flujo de cuentas se parte en dos. Confirmado

Tenías razón: son dos pantallas y construiste una. Alfredo confirma **partirlo**.

    Cuentas (índice)          →   Cuenta (detalle)
    header + accounts-grid        breadcrumb + AccountSummaryCard + LedgerContainer

El índice **pierde** el resumen y el ledger. El detalle abre con `breadcrumb`
(`Cuentas › CMR Falabella`), que es por fin dónde vive ese componente sin consumidor.

Tu medición entró en la decisión: con siete cuentas, a 412 la grilla ocupa dos filas y empuja la
tarjeta de resumen por debajo del pliegue. El cómo es tuyo y del orquestador; no hace falta router.

## 3. `Progress` — el track ya tiene su propio token, quita el filete

Tenías razón y era peor de lo que medías: `bg/neutral-subtle` y `bg/surface` son el **mismo valor**
en claro (#f1f5f9, 1.00:1), y en oscuro tampoco se salva (1.12:1).

**Token nuevo: `--progress-track`.** slate/200 en claro, slate/700 en oscuro. Propio, no
`bg/neutral-subtle`, porque ese tiene otros consumidores y esto es otro trabajo (regla 7).

Tu voto por "un peldaño más oscuro" era el correcto, **y un peldaño es el único que había** —
medido, los dos requisitos se cruzan justo ahí:

    track          fill vs track (C/O)   track vs surface (C)
    slate/100      3.44 · 3.44           1.00   ← invisible
    slate/200      3.06 · 3.05           1.13   ← el nuevo
    slate/300      2.54 · 2.53           1.36   ← el fill se cae de 3:1

**Quita el filete interino.** Lo rechacé mirándolo, no por los números: una pastilla redondeada con
borde se lee como un campo donde se escribe, y un track vacío no es un control.

Lo demás de tu nota entró tal cual — el badge en la cabecera del GroupBox, "Se paga en X" en
presente (mejor que mi copy), la tarjeta de reserva encima del vacío, y "Faltante" siempre. Ese
último es correcto por la razón que diste: un número grande que significa dos cantidades según el
estado no es un número, son dos.

## 4. `ledger-itemrow` · `State=Opening` ya no dibuja papelera

El frame estaba atrasado respecto a lo que te contesté. Corregido en el componente, no en el
frame, así que cualquier instancia lo hereda.

## Y una que te tengo que corregir, porque te la di al revés

Te dije que **las métricas discretas eran correctas** y construiste cinco pares. **El
`AccountSummaryCard` de Figma no es eso**: sigue con la línea corrida en la meta
(`0% usado · Corte 4 · Pago 20`) más **dos** métricas. Yo lo reestructuré esta tarde a pares y
**Alfredo lo revirtió**: esa tarjeta es diseño suyo y la versión buena es la de Figma.

Así que **no cambies lo que ya publicaste todavía** — está en manos de Alfredo, no mías, y te aviso
en cuanto lo decida. Lo digo ahora y no cuando esté resuelto porque implementaste contra una
respuesta mía que no tenía autoridad para dar.

POINTER: Figma `379:12631` (AccountSummaryCard), `963:23` (Progress), `857:332` (ledger-itemrow),
`396:16108` (flujo); design-system/components/savingscard-legacy.html;
design-system/tokens/tokens.css (--progress-track).
