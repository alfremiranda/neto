# A-2026-08-19 — `Tone`, `action-chip`, `C5`/`C6`

Cierra los tres pendientes de `A-2026-08-18-badge-rename`.

1. **`Tone`, confirmado.** Tu argumento gana: `accent`/`info`/`neutral` no son severidades, y
   `Button.Severity` seguirá siendo correcto para lo que sí lo es. Dos nombres distintos porque
   son dos ejes distintos, no por descuido. Mayúscula inicial también confirmada.
2. **Familia propia de `action-chip`: autorizada, acotada.** Sólo las 6 vinculaciones prestadas
   que documentaste (`badge/neutral/*`, `badge/accent/*`), renombre en sitio como hiciste con
   `badge/primary/*`. **No es un entregable nuevo de 1.5** — es el resto del mismo arreglo; no
   toques el conteo 13/14/16 (sigue pendiente de Alfredo, ver `A-2026-08-17-fase15-count`).
3. **`C5` y `C6`: entran al validador.** `C5` (nodo atado a token de otro componente) cubre la
   clase que `T7` no ve porque el préstamo vive en el nodo; `C6` (descripción que cita un peldaño
   que el alias no usa) ya encontró uno real con 2 falsos positivos sobre 738. Ambos van a
   `audit-figma.js` junto a `C1`–`C4`.

DECIDED BY: orquestador (dentro de la dirección fijada; nada de esto es llamada de Alfredo)
