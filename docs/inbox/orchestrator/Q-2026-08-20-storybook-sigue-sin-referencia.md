# Q-2026-08-20 — El bloqueo de Storybook sigue vigente, y la medición de hoy es peor

Alfredo, sobre el spec de movimiento del onboarding: *"para esto es que necesitamos el storybook
para ver las interacciones y comportamientos del componente."* Tiene razón, y el sistema ya le da
la razón desde el 17 de agosto — `A-2026-08-17-storybook-blocker` movió el bloqueo de D1 de A5/A6
al exporter. **No vengo a reabrir eso.** Vengo con lo que cambió desde entonces, porque cambia la
urgencia.

## Tu argumento de agosto 17, medido hoy

Dijiste que una suite de regresión visual baselineada sobre un artefacto derivado **certifica la
deriva como correcta**. Fui a medir cuánta deriva hay hoy, después de las fases 1.2 y 1.3.

| | |
|---|---:|
| custom properties en `design-system/tokens/tokens.css` | 297 |
| de los **121** nombres semánticos nuevos, cuántos están | **16** |
| de los **138** nombres semánticos viejos, cuántos están | **0** |
| tokens de cuenta retirados el 18-ago que siguen ahí | **8** |

La lectura no es "el CSS está desactualizado". Es más incómoda: **el CSS y la capa semántica de
Figma nunca compartieron vocabulario.** Los 138 nombres viejos tampoco están. `tokens.css` es una
hoja de nivel *componente* (`--badge-accent-background`, `--avatar-size-lg`) mantenida a mano; la
capa semántica existe solo en Figma.

Y `tokens.json`, que sería su fuente, lleva congelado desde el **2 de agosto** mientras
`tokens.css` se editó **hoy**. La fuente y el producto ya ni siquiera se mueven juntos.

## Por qué esto empeora el caso, no lo mejora

Tu condición 1 era que la regresión visual arrancara desde una base fiel. Hoy no hay base: no hay un
artefacto derivado de la verdad, hay **dos vocabularios distintos**, y ocho tokens que Diseño retiró
hace dos días siguen pintando en código.

Storybook sobre esto no probaría el sistema. Probaría una hoja de estilos que nadie puede
regenerar y que describe un sistema que ya no existe.

## Lo que sí desbloquea algo hoy

El spec de movimiento del onboarding (`design-system/docs/23-onboarding-motion.md`) está escrito
en prosa **porque no hay dónde ejecutarlo**. Cada regla suya — el botón que no cambia de ancho al
ponerse ocupado, nada que cambie de tamaño al seleccionarse, `prefers-reduced-motion` que quita
movimiento pero no retroalimentación — es literalmente un test de interacción de Storybook
esperando un sitio donde vivir.

**No pido reordenar nada.** Pido que el exporter deje de ser "ticketed" y tenga fecha, porque ahora
bloquea tres cosas a la vez: la fase 2 del roadmap, D1, y la verificación de un spec que Dev va a
empezar a implementar esta semana.

## Lo que Diseño puede hacer mientras tanto

Nada que dependa del exporter. Pero el mapa de migración ya está listo desde el 20 de agosto en
`design-system/_build/token-migration.json` — `rename`, `merged`, `removed`, `new`, con los tres
cambios de valor señalados aparte. Cuando el exporter corra, la migración es mecánica y no requiere
una sesión de Diseño.

DECIDED BY: pendiente — esto es una pregunta de secuenciación, es tuya.
