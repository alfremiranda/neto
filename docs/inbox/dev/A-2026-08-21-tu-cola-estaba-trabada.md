# A-2026-08-21 — Tu cola estaba trabada, y no era culpa tuya

## El nudo

Tres instrucciones mías, cada una correcta por separado, que juntas te dejaban sin nada que hacer:

- `TASK-2026-08-20-migracion-de-tokens` (aunque dice `TASK`, su cuerpo es un `FYI`): **"no corras
  nada aún, el exporter sigue sin haberse ejecutado"**.
- El sync: **"migra primero, extrae después"** — cierto, `Badge.tsx` usaría nombres muertos.
- Luego `TASK-extraer-badges` espera a la migración, la migración espera al exporter, y **el
  exporter no espera a nada: no lo corría nadie.**

**Por qué no lo corría nadie:** es una operación a dos manos y el relevo entre ellas no tenía dueño.
`figma-dump.js` corre dentro del sandbox de Figma — es de Diseño, y por eso no puede leer el mapa.
`apply-rename-map.mjs` corre local, es tuyo. El handoff de Diseño decía "fase 2 bloqueada en Dev"
mientras tú esperabas su volcado. Defecto de orquestación, mío.

## Lo que se hace ahora

1. **Diseño corre la etapa 1 y commitea `_build/figma-dump.json`** con el archivo de hoy. Ya tiene
   el ticket.
2. **Tú corres la etapa 2 + `build.py` en cuanto ese archivo aparezca.** No esperes un "inbox":
   el volcado en el árbol es tu señal.
3. **Reportas el diff entero.** Va a ser grande y eso es correcto, no alarmante — es la primera vez
   que el lazo se cierra desde que Diseño renombró 121 colores, colapsó las escalas numéricas y
   añadió `spacing/6`, `radius/2`, `radius/10` y `slate-40/30/20`.

**Dos valores del diff ya están decididos y no se relitigan:** `--fav-selected-foreground` **se
queda en `#b45309`** (el bug está en Figma, ver `A-2026-08-20-no-regenerar-la-estrella`) y
`--sidebar-surface` pasa a `#ffffff`.

**Todo lo demás que aparezca es deriva real: repórtala, no la absorbas.**

## Después de eso, el orden no cambia

migración de tokens → extraer badges → consentimiento. La razón sigue en pie: extraer antes de
migrar es extraer contra nombres muertos.

## Tres cosas de la migración que no son renombres — ya te las dijo Diseño, las repito porque son lógica y no CSS

1. `--fg-income` dejó de ser cyan (lo era por accidente) y ahora es blue-700.
2. `--fg-net` aliasa el cyan de marca **a propósito** — pero **un neto negativo tiene que pintarse
   con `--fg-expense`**. Eso es un condicional donde se pinte la cifra, no un cambio de variable.
3. El eyebrow `PASO N DE 3` ya no va en color de marca.

## Y una que sí es tuya y paga sola

Ahora que el nombre declara la propiedad, **un `--fg-*` en un `border-color` o un `--bg-*` en un
`color` es un defecto detectable por lint.** En Figma esa misma comprobación encontró tres fugas
reales que llevaban meses invisibles — `border/default` usado como relleno 88 veces, entre otras.
Si añades un check al CI, ese es el que más paga.

Gracias por el reporte del validador (`ff029c29`). Quedó cerrado `Q-2026-08-20-reporte-faltante`.

DECIDED BY: orquestador 2026-08-21
