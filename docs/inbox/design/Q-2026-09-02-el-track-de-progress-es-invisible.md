# Q-2026-09-02 — el track de `Progress` es invisible en claro, y es un valor no un sitio

Construí las cinco de `A-2026-09-01`. Cuatro entraron tal cual. La quinta encontró esto.

## El defecto

`progress.html` pone el track en `bg/neutral-subtle`. Medido en el navegador:

    bg/neutral-subtle   #f1f5f9   (claro)
    bg/surface          #f1f5f9   (claro)   ← toda card de la app

**El mismo valor exacto.** El track es invisible sobre las dos superficies que lo consumen, y a
0% —que es justo el estado de la reserva de retención hoy, con $0 apartados— **la barra entera
desaparece**. No hay nada que ver donde debería haber una escala vacía.

En oscuro no ocurre: `#1e293b` contra `#162032`.

La descripción mide **relleno-contra-track** (Provision 3.44/7.61, Expense 3.44/5.29) y esas dos
están bien. Lo que nadie midió es **track-contra-card**, que en claro es 1.00:1. Y tu propio
argumento aplica igual: si la barra lleva su significado por su límite, el límite tiene que
existir — a 0% el track *es* toda la barra.

Es un problema de peldaño, no de sitio, exactamente como el amber/400 que llevas cuatro
apariciones persiguiendo. Un track que no se distingue de la superficie no funciona en ninguna
tarjeta, no solo en estas dos.

## Lo que puse mientras tanto

Un filete en `border/subtle` alrededor del track. **No acuñé nada**: ese token existe para
exactamente eso, un límite sobre una superficie. Pero cambia la forma que dibujaste (8 de alto,
extremos redondos, sin borde), así que es interino y quiero tu decisión.

Tres salidas que se me ocurren, y la elección es tuya:

1. **Un peldaño más oscuro para el track** — slate/200 en vez de slate/100. Conserva la forma.
2. **El filete que puse**, si el track debe seguir siendo el mismo tono que la card.
3. **`bg/surface` cambia** y el track se queda — pero eso mueve toda la app por una barra.

Voto por 1: es un peldaño, conserva el dibujo, y arregla el caso para cualquier consumidor
futuro sin que cada uno tenga que acordarse del borde.

## Las otras cuatro, hechas

- **Q1** Badge `Pendiente`/`Pagado` en la cabecera del `GroupBox`, no en la fila. `Pagado` en
  neutral, por la razón que diste. La fila provisional ya no existe: cuando está pagado no queda
  fila, porque una fila cuyo único contenido es "Al día" es mobiliario.
- **Q2** El bloque de vencidos es una fila y van todas dentro de un solo bloque con encabezado,
  más viejas primero. Cambié tu copy en un punto: la sub-línea dice **"Se paga en X"**, presente,
  no "Se pagaba". El bloque lista el mes que vence AHORA junto a los que se saltaron, y el
  pasado le diría al primero que va tarde cuando apenas es pagable.
- **Q3** `Progress` acuñado con sus dos tonos, y sus dos consumidores conectados: la reserva y el
  "12% usado" de la tarjeta, que era texto pelado. La tarjeta de reserva va **encima** del estado
  vacío de Ahorros, no dentro del ramal que tiene cuentas: quien no ha apartado nada es
  precisamente quien necesita ver la brecha.
- **Q4/Q5** ya estaban.

Una que decidí y quiero que mires: en la tarjeta de reserva el titular dice **siempre
"Faltante"**, incluso en $0. Cambiarlo a "Cubierto" con otra cifra haría que el número grande
significara dos cantidades distintas según el estado.

POINTER: src/components/ui/Progress.tsx, src/components/cards/ReservaCard.tsx,
src/components/cards/AccountSummaryCard.tsx, src/components/cards/ObligacionesCard.tsx.
