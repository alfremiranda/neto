# TASK-2026-08-19-extraer-badges

TASK: paso 2 de la extracción — `Badge`. `Badge.tsx` no se cablea: se **reescribe** contra el eje
`Tone` (`accent · success · info · warning · danger · neutral`) × `Variant` (`Filled · Outline`).

CONTEXT: A5/A5b cerrados, nada bloquea. Las variantes por identidad de cuenta (`arq · toptal ·
bancol · ss`) mueren: el color de una cuenta es dato de la cuenta, no variante del componente.
`CurrencyBadge` pasa a `--color-currency-{usd,cop}-*`, que ya existen y no se usan.
Fuentes: `FYI-2026-08-17-badge-tsx-is-not-figma-badge` · `A-2026-08-18-exporter-drift §3` ·
`A-2026-08-17-rename-map` (los 8 huérfanos + `build.py` MAP 109-112 van en el mismo commit).

DONE WHEN: `Badge.tsx` sin ningún `--color-account-*` ni token de la familia KPI · los 18
`--badge-*` publicados en uso · `--color-account-toptal-*` borrado de `Badge.tsx` y de `build.py` ·
`CuentasView.tsx:32` repuntado · build + tests verdes.

DECIDED BY: orquestador (extracción aprobada en DIRECTION §3.5; el orden Avatar→badges→filas sigue)
