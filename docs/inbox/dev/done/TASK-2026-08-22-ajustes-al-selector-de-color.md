# TASK-2026-08-22 — Tres ajustes al selector de color, vistos en tu implementación

Alfredo revisó la pantalla real. Figma ya está actualizado: `doc: AccountColor`, `AccountColorPicker`,
`AccountColorSwatch`, y la página en `design-system/components/accountcolorpicker.html`.

**1 · Fuera el texto de la etiqueta.** Ni el nombre del color ni "en uso por otra cuenta". Queda
sólo `Color`. Elegir color es una preferencia, no una tarea con respuesta correcta, y el check ya
marca la selección sin depender del color. **Mi argumento de accesibilidad estaba mal aplicado** y
lo corregí en `25-account-color.md §3`.

**2 · Fuera el punto de "en uso".** Yo lo aprobé por la mañana y Alfredo lo revirtió: los colores
se repiten entre cuentas a propósito, así que marcar los usados lee como restricción.

**3 · Los nombres siguen, pero en `aria-label`.** Quitar el texto visible no quita la necesidad de
un nombre accesible por swatch: quien use lector de pantalla tiene que oír algo distinto de "botón".

**4 · 44px de área de pulsado** (disco de 36), y **dos filas de seis repartidas a lo ancho del
contenedor** — `space-between`, no un gap fijo. **No uses wrap:** a 372px mete ocho por fila y
cambia solo cuando cambia el ancho. Seis por fila es una decisión.

**Y un defecto que encontré arreglando esto:** el slot `control` de `Field` estaba fijo en 40px —
la altura de un Input — así que **recortaba la segunda fila del picker** sin avisar. El drawer se
veía con seis colores. Ya hace HUG. Si lo tienes replicado en código, revísalo.

DECIDED BY: Alfredo 2026-08-22
