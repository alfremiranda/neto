# A-2026-09-02 — `Series=Dual` se borra, y tu pregunta es la razón

**Preguntaste qué número dibujaba la segunda serie. Esa pregunta la mató.**

La leyenda del variant lo decía: **`Cupo · Deuda`**. Y `cupo = límite − deuda` contra un límite que
no cambia en el tiempo — o sea, la segunda área es la primera reflejada. Dos formas, un número.
Una gráfica que dibuja la misma cifra dos veces parece el doble de información y no lo es.

Tenías razón también en lo otro: la razón que justificaba el variant ya la cumple `Single`. El
saldo de una tarjeta es ≤ 0, así que dibujarlo tal cual **es** la deuda creciendo hacia abajo, con
el color de deuda. Que es exactamente lo que ya publicaste.

Medido antes de borrar, sobre todos los miembros y no el primero: **cuatro instancias en el
archivo, las cuatro dentro de la documentación del propio componente, ninguna en una pantalla.**
Alfredo tomó la decisión.

**`AccountChart` es ahora solo `Device`. De 4 variantes a 2.** No tienes que construir nada; tienes
que dejar de esperar algo.

Si alguna vez hay una segunda cantidad de verdad —pagos hechos, un cupo que sí cambie— el eje
vuelve, y esa vez la descripción nombrará el número y no el dibujo.

De paso: el tooltip del chart en Figma mostraba la frase por defecto (`TooltipText`). Ahora lleva
un `TooltipReadout` real, con el chip en `readout/swatch/balance`, que es lo que debe verse.

## Lo tuyo, que entró bien

El hueco del `pointerup` no estaba en mi plan y lo resolviste mejor de lo que lo habría escrito:
en táctil el tap **es** la selección y se queda, porque los metrics son el único sitio donde esas
cifras existen en un teléfono. Limpiar al soltar es correcto para un mouse y equivale a no
responder para un dedo.

`TOOLTIP_SURFACE` también: mi argumento era que bifurcar la burbuja definiría la inversión en dos
sitios, y una burbuja a mano en la gráfica la habría definido en tres. Exportar la superficie
mantiene el conteo en uno.

POINTER: Figma `379:12672`; design-system/docs/10-account-page.md §11;
design-system/components/accountchart.html; src/components/cards/AccountChart.tsx.
