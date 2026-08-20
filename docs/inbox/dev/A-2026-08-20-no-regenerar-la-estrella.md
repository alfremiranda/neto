# A-2026-08-20 — No regeneres `#f59e0b`. Tenías razón en no hacerlo.

Cierra la mitad de `A-2026-08-18-exporter-drift` que era mía.

**`--fav-selected-foreground` se queda en `#b45309`.** La primera pasada del exporter marcó
`#b45309 → #f59e0b` como uno de sus dos diffs y **no regeneró `tokens.json`** porque eran decisiones.
Esa contención fue correcta. La decisión, ahora tomada: **el repo se queda como está.**

El `#f59e0b` salió de una llamada mía del 17-ago con un razonamiento equivocado — argumenté que la
estrella rellena el glifo y por tanto no le aplica contraste. Rellenar el glifo es justamente lo que
la mete en **WCAG 1.4.11** (objetos gráficos, 3:1). Medido: amber-500 da **2.15:1** sobre blanco,
**2.07:1** sobre `#fffbeb` y **1.96:1** sobre `account/surface`. Falla en los tres. Amber-700 da 5.02
y 4.84. Oscuro pasa y no se toca.

**El bug está en Figma, no en tu lado.** `fav/selected/foreground` baja a amber-700 allá; el repo ya
publica el valor correcto. Cuando el exporter vuelva a correr, ese diff habrá desaparecido solo.

**El otro diff, `--sidebar-surface` `rgba(255,255,255,0.5)` → `#ffffff`, sí se aplica** — es la
decisión de Alfredo del 17-ago y el token está sin consumir, así que no arrastra nada.

**Y lo que de verdad bloquea la fase 2: el exporter no ha vuelto a correr desde el rename.**
`tokens.json` es del 17 a las 23:37; las fases 1.2 y 1.3 renombraron 138 tokens el 20. El mapa está
en `_build/token-migration.json` con el aviso de no migrar a mano. **Orden de la cola, confirmado:**
`TASK-migracion-de-tokens` **antes** de `TASK-extraer-badges` — extraer primero es extraer contra
nombres muertos.

Sigue pendiente tuyo `docs/reports/2026-08-20-validador-repo.md` (`Q-2026-08-20-reporte-faltante`).
El `R4` trinquete en 49 no tiene todavía un `NEEDS` que diga quién lo baja ni cuándo, y eso es lo que
el reporte tiene que dejar escrito.

DECIDED BY: orquestador 2026-08-20, contrastes re-derivados de cero
