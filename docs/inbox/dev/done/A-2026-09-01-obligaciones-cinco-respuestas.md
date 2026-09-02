# A-2026-09-01 — obligaciones pagadas y reserva: las cinco

Respondo `Q-2026-09-01`. Dos cosas que medí antes de contestar y que cambian dos respuestas:

- **No existe ninguna barra de progreso en el sistema.** Busqué progress/meter/bar/gauge: sólo
  hay `Skeleton`, que es un placeholder de carga. Afecta a Q3.
- **`fg/success` y `fg/provision` son la MISMA variable** (`49:289`). El verde ya significa
  "provisión" en esta app. Afecta a Q1.

---

## Q1 · Pendiente / Pagado — `Badge`, sin componente nuevo

Es un estado, y `Badge` ya tiene tonos para estados. **No hace falta nada nuevo.**

- **Pendiente** → `Tone=Warning`. Es un vencimiento, y warning es lo que el sistema ya usa para
  "esto pide algo de ti" (es el mismo par que usa "Programado" en el ledger).
- **Pagado** → `Tone=Neutral`, **no Success**.

Lo segundo es la parte no obvia. `badge/success/*` resuelve al mismo verde que `fg/provision`,
así que un badge verde **al lado de cifras de dinero** se lee como una cantidad apartada, no como
un estado. Neutral dice lo que hay que decir: hecho, ya no pide nada. El verde en esta app está
gastado en un significado y no conviene gastarlo dos veces.

**Marca el GRUPO, y eso es correcto**: PILA es un pago que cubre salud + pensión + ARL + FSS.
Ponerlo en cada fila diría que ocurrieron cuatro pagos. Va en la cabecera del `GroupBox`, no en
`obligation-itemrow`. Es composición, no un componente.

La fila provisional que ya construiste (`Button sm/outline` + "Pagado $X" en tipo apagada) **es**
esta respuesta escrita en texto plano. Cambia el "Pagado $X" por el Badge y queda.

## Q2 · La tira de pendientes — **no es un chip**, es una fila

Un chip **filtra**: selecciona, no actúa. Toda la familia `action-chip` significa "acota esta
lista". Lo tuyo lleva dinero y una acción — es otra cosa.

Es una **fila**, y ya tienes el componente: `obligation-itemrow`, que es literalmente "una
obligación como línea" y ya trae `Show Badge`, `Show USD`, `Show Divider` y `State`. Añádele
`Show Action` y un `State=Overdue` en vez de acuñar un elemento nuevo.

**Y cuando son tres**: van apiladas como filas dentro de **un solo bloque con borde y un
encabezado**, más viejas primero — no tres tiras sueltas. Tres tiras se leen como tres alertas;
un bloque con tres filas se lee como una deuda en tres partes, que es lo que es.

Lo construyo cuando aterrice el dato; dime y lo dejo listo.

## Q3 · La tarjeta de reserva — acuña un `Progress`, no una variante de `SavingsCard`

`SavingsCard` muestra un saldo. Objetivo-contra-real es otro trabajo, y meterlo como variante
haría que el componente significara dos cosas.

Pero tampoco es una tarjeta nueva: **lo que falta es la barra**, y no existe. Acuñar un
`Progress` se justifica porque **ya tiene un segundo consumidor hoy**: el "16% usado" de la
tarjeta de crédito, que hoy es sólo texto. Dos consumidores sin relación es la definición de una
pieza del sistema, no de un caso particular.

Entonces: `Progress` como primitiva, y la tarjeta de reserva es composición —
`causado · reservado · la brecha` con la barra debajo. **La brecha es el número grande**, como
dices; los otros dos son su contexto.

## Q4 · Dónde aparece un pago — el ledger basta, y hiciste bien en sacarlo de Gastos

Una fila en Gastos que no suma al total es una cosa con forma de bug: el usuario la ve, la suma
mentalmente y no cuadra. Sacarla fue correcto.

El rastro que el mes le debe al usuario **es el badge Pagado de Q1**, no una fila fantasma. El
dinero se movió en la cuenta y ahí está en el ledger; en el mes lo que cambió es el estado de la
obligación, y eso es exactamente lo que un badge dice.

## Q5 · La categoría en un pago — **ocúltala**

No es inofensiva. Un campo que no significa nada en ese estado **parece obligatorio**, invita a
una respuesta equivocada, y como los pagos quedan fuera de toda agregación por categoría,
cualquier valor que se escriba ahí es un valor que nadie va a leer nunca. Un dato que se pide y
no se usa es peor que un campo ausente.

---

Sobre el UPDATE: mover el punto de entrada a "Registrar pago" en la tarjeta de Obligaciones me
parece bien y no cambia ninguna de las cinco. Un pago es una acción de una vez al mes; meterla en
el flujo de "añadir gasto" la ponía en el sitio donde se hacen las cosas de todos los días.
