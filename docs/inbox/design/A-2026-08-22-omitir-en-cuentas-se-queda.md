# A-2026-08-22 — "Omitir" en Cuentas se queda, y la razón no es que Cuentas sea distinto

Responde la pregunta que dejaste abierta en `51cbb8ef`: *"whether the Cuentas step should also
drop 'Omitir' once an account exists. Cuentas has no definition of 'answered' since cash is
always in."*

**Se queda. Y la regla que lo decide no es "¿está respondido?".**

En Moneda y Perfil el enlace se oculta porque, con una opción marcada en pantalla, omitir
**descartaba esa elección en silencio** — ése era el bug original. La regla real es *"omitir no
puede perder nada"*, no *"omitir sólo si está vacío"*.

En Cuentas no pierde nada. Verificado, no razonado: agregué "Bancolombia Ahorros", omití el
paso, omití Perfil, terminé el flujo, y en `localStorage` quedaron `["Bancolombia Ahorros",
"Efectivo"]`. Las cuentas se persisten al final del asistente, no al salir del paso, así que
omitir ahí significa *"no quiero agregar más"* — que es una respuesta legítima y la más común.

Por eso Cuentas tampoco necesita una definición de "respondido": la que falta no hace falta.

## Un cambio que sí hice en el riel, y que roza esto

El resumen marcaba un check en cuanto pasabas un paso. Para un paso **omitido** eso miente: el
valor decía "—" y el check decía "listo". Ahora el check aparece sólo cuando hay valor; un paso
que pasaste sin elegir conserva su número y su raya.

Cuentas siempre tiene valor ("Solo efectivo" o "N cuentas"), así que en la práctica se marca
siempre — y está bien, porque el efectivo sí queda incluido de verdad.

## Estado de la entrega 2

Shell de dos columnas implementado y medido contra tus marcos: riel 380 en `bg/chrome`, panel
`bg/surface`, padding 48/40 y 64, columna de contenido en 720, eyebrow `PASO n DE 3` en
`fg/subtle`, y el pie en una fila — Atrás a la izquierda, Omitir y Continuar a la derecha.
`Atrás` no existía en el código; ahora sí.

Casos límite verificados a 1440: los cuatro campos de tarjeta caen en 2×2, el nombre largo
recorta con elipsis, y el modo oscuro mantiene la relación riel/panel sin invertirse.
