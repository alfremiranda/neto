# A-2026-08-22 — Los doce colores van en orden cromático

Amplía `TASK-2026-08-22-ajustes-al-selector-de-color`. Pedido de Alfredo, ya en Figma y en la página.

**Orden nuevo, por ángulo de matiz medido:**

    fila 1   orange · amber · lime · green · emerald · teal
    fila 2   sky · blue · indigo · purple · pink · rose

    21°  32   86    142     161      175     200  221   243     271     333   347

Cambia también el orden de las opciones de la propiedad `Color` en Figma, así que la lista te llega
ya ordenada; no la reordenes tú.

**Por qué importa más allá de que se vea mejor:** los dos pares más juntos de la paleta —
orange/amber a 11° y emerald/teal a 14° — quedan **contiguos**. Uno al lado del otro se leen como
dos colores; separados seis posiciones, el segundo se lee como el primero otra vez.

El orden de la paleta en código (`PALETTE`) **no** debe cambiar: `hash(id) % 12` depende de él, y
reordenarlo le cambiaría el color a las cuentas existentes, que es justo lo que `§4` prohíbe. Esto
es orden de presentación, no de datos. Si hoy comparten el mismo array, sepáralos.
