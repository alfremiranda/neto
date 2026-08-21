# TASK-2026-08-21 — Corre la etapa 1 del exporter, y el reporte de 14 commits

## 1. La cola entera de Dev está trabada detrás de una corrida que nadie tiene asignada

Esto es un defecto mío, no tuyo, y lo levanto porque lo encontré leyendo el árbol:

- `TASK-2026-08-20-migracion-de-tokens` dice, con razón, **"no corras nada aún: el exporter sigue
  sin haberse ejecutado"**.
- El sync le dijo a Dev **"migra primero, extrae después"**, porque `Badge.tsx` usaría nombres
  muertos.
- Así que **`TASK-extraer-badges` espera a la migración, la migración espera al exporter, y el
  exporter no espera a nada — sencillamente nadie lo corre.**

Y no lo corre nadie porque **es una operación a dos manos y el relevo entre ellas no tenía dueño**:
`figma-dump.js` corre **dentro del sandbox de Figma** (tuyo, sin sistema de archivos) y
`apply-rename-map.mjs` corre **local** (de Dev). Tu handoff dice "fase 2 bloqueada en Dev"; Dev no
puede empezar sin tu volcado. Cada lado creía que el otro lo tenía.

**Asignado, y esto es lo que desbloquea el proyecto entero:**

1. **Tú corres la etapa 1** y commiteas `_build/figma-dump.json` con el archivo **como está hoy** —
   después de 1.4, del barrido, del rung review y de la escalera de superficies de Light.
2. Dev corre la etapa 2 y `build.py`, y reporta el diff. Ya tiene ticket.
3. Los dos únicos diffs conocidos del 17-ago están decididos y no deberían reaparecer: la estrella
   **se queda en `#b45309`** (Figma es la que baja a amber-700; ver
   `A-2026-08-20-fav-star-contraste-y-cierres`, que sigue **sin procesar** en este buzón) y
   `--sidebar-surface` va a `#ffffff`.

**Todo lo demás que salga del diff es deriva real y hay que reportarla, no absorberla.** Van a ser
muchos: 121 colores renombrados, escalas numéricas colapsadas, `spacing/6`, `radius/2`, `radius/10`,
`slate-40/30/20` y siete valores distintos de superficie en Light. Es la primera vez que el lazo se
cierra entero.

## 2. El reporte: 14 commits, y hace cuatro días levantaste tú este mismo bloqueo

Tu último reporte es `2026-08-20-fases-0-1-3-rename-de-tokens.md`, de las 12:23 del 20. Desde ahí y
hasta las 00:19 del 21 hay **14 commits sin reporte y sin actualizar `docs/handoff/design.md`**:
fase 1.4, el barrido de 198.175 bindings, el rung review, `Field` retirando `DatePicker` y
`MoneyInput`, los campos de onboarding, y la escalera de superficies de Light con tres primitivas
nuevas.

No te lo cobro como descuido — el trabajo es bueno y está bien enrutado; el `FYI` de
`DatePicker`/`MoneyInput` llegó a Dev por su cuenta, que es exactamente lo que debía pasar. Te lo
cobro porque **es el mismo bloqueo que levantaste tú el 20**, con las mismas palabras: trabajo
irreversible en Figma que sólo existe en mensajes de commit. Y esta vez es más grande.

Dos cosas de esos commits **tienen que llegar a Alfredo por un `NEEDS`** y hoy no llegan:

- **El near-miss de `SavingsCard · Show Maturity`.** Estuviste a punto de borrar un booleano vivo
  porque el escáner muestreó la primera variante de cada set. Un CDT tiene fecha de vencimiento y
  una cuenta de ahorros no: el diseño tenía razón y el instrumento no.
- **Tu propia corrección sobre las cuatro superficies en `color/white`.** Defendiste el blanco
  compartido por argumento perceptual y luego lo retiraste tú mismo citando la Regla 7. Ese
  razonamiento —*la perceptibilidad es razón para fijar un valor con cuidado, no para no darlo*—
  vale más escrito en un doc que enterrado en un commit.

**Cuando cierres:** reporte + handoff, y el handoff con el `unpushed:` dentro.

DECIDED BY: orquestador 2026-08-21 — el punto 1 es asignación de un relevo que no tenía dueño.
