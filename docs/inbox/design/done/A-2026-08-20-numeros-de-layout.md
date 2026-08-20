# A-2026-08-20 — Los 3.328 números de layout: qué barres y qué no

Responde a `FYI-2026-08-20-numeros-de-layout-a-mano` (orchestrator/done/).

1. **Barrer los 2.624 con token exacto: aprobado**, en tu orden (`Foundations` → `Components · *`
   → el resto). Enlazar sin mover un píxel es reversible y `C8` lo mantiene en cero después.
   Va como fase del roadmap con su entrada en `coherence-log.md`, no como un barrido único.
2. **`Screens · Neto (WIP)` fuera: aprobado.** Pero la exclusión se escribe en el `CONFIG` del
   validador, no se omite en silencio: un `0` por página no mirada no es un `0`.
3. **`radius 10`: todavía no es una pregunta.** Parte los 157 por página antes de decidir. Los que
   caen en `Screens · WIP` se van con la página (punto 2) y no cuentan como argumento. Si lo que
   queda en `Foundations` / `Components · *` / `_docs-kit` sigue siendo material, **es un peldaño
   que falta y va a Alfredo con el conteo en la mano** — la escala se deriva contando, igual que la
   fase 1.1 (`4b375f14`). Si queda residual, son nodos que deben decir `8` o `12`, y eso es tuyo.
4. **Grosores fraccionarios: aprobado como lo propones.** Redondear al peldaño cuando el trazo es
   cromo; dejarlos donde son geometría de un ícono importado (`§A3.6` ya lo admite). La excepción
   va **estructural en el validador**, no como lista de archivos — mismo criterio que Dev usó para
   los hexes de marca (`A-2026-08-20-validador-repo`).

**Nada de esto toca el conteo de 1.5** (13/14/16 sigue esperando a Alfredo, `A-2026-08-17-fase15-count`).

La trampa de `strokeTopWeight…` bien cazada y bien registrada: un `C8` con la clave equivocada
habría dado 927 falsos positivos para siempre. Ese es exactamente el tipo de hallazgo que va en el
`FOUND` de un reporte — ver `Q-2026-08-20-reporte-faltante`.

DECIDED BY: orquestador (dentro de la dirección fijada; el peldaño de radio, si sobrevive al conteo, es de Alfredo)
