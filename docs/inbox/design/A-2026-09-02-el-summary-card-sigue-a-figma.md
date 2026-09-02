# A-2026-09-02 — el `AccountSummaryCard` sigue a Figma, y `Progress` se quedó con un consumidor

Alfredo cerró la duda: **"ya el componente está creado en Figma como quiero que se vea, síguelo a
él"**. Así que lo leí del archivo (`379:12631`, las ocho variantes) y no de las notas.

## Mis cinco pares se fueron

Quedan **como máximo dos** figuras, y la de la derecha es la titular:

    Credit Card   Deuda −$0,00   ·   Cupo $0,00
    Savings       Intereses ≈+$0,00   ·   Saldo actual $0,00
    Bank Account  Saldo actual $0,00
    Cash          Saldo actual $0,00

Bank y Cash llevan **una sola**, no dos con un hueco. No hay segunda cantidad que mostrar y un
espacio reservado se la inventaría.

Lo demás según tu spec: la meta es una lista de **campos**, cada uno su propio nodo, con
`Separator` como instancias — un campo sin valor no está en la lista y no deja un `·` huérfano.
El chip de fechas solo cuando el tipo tiene fechas sobre las que actuar. Y el `flex-wrap` es
**una declaración**, no cuatro: Figma decide el envoltorio variante por variante porque dibuja un
estado a la vez, pero CSS solo envuelve al desbordar, así que los cuatro comportamientos salen
solos y lo que baja de línea es el chip entero.

También entraron la estrella de favorito y el botón Editar debajo de la meta, alineado a la
izquierda — yo lo tenía arriba a la derecha.

## `Progress` se quedó con UN consumidor, y era tu argumento para acuñarlo

Aquí hay algo que resolver, y no lo decido yo.

`progress.html` justifica la primitiva con dos consumidores: la reserva de retención y **"el
`16% usado` de la tarjeta de crédito, que hoy es texto pelado"**. Regla 11, dos consumidores sin
relación.

Pero el `AccountSummaryCard` de Figma **no dibuja ninguna barra**. El `0% usado` vive en la meta
como texto, exactamente igual que antes. Miré las ocho variantes por si estaba en alguna: no está.

Yo la había puesto ahí. **La quité**, porque la instrucción de Alfredo es seguir el archivo. Pero
eso deja `Progress` con un solo consumidor, que es justo lo que la regla 11 dice que no basta.

Tres salidas, y es tuya con Alfredo:

1. **La barra sí va en la tarjeta** y el frame es lo que está atrasado. Entonces dime dónde,
   porque el sitio donde yo la puse era invención mía.
2. **La barra no va**, y `Progress` se justifica solo con la reserva — entonces habría que
   corregir la descripción, que hoy cita un consumidor que no existe.
3. La barra vive en otro sitio que yo no he visto.

No toco nada hasta que digas. La primitiva sigue construida y en uso en la reserva.

POINTER: Figma `379:12631`; design-system/components/progress.html, accountsummarycard.html;
src/components/cards/AccountSummaryCard.tsx.
