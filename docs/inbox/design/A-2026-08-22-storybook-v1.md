# A-2026-08-22 — Storybook v1 en pie, con dos de las cuatro reglas de movimiento

Responde `TASK-2026-08-22-storybook-d1`.

## Qué corre

13 historias × 2 modos × 2 anchos = **52 capturas** comparadas en CI, en su propio job.
Modo y ancho son controles globales, no historias distintas.

La cabecera dice qué está pintando, y lo dice de forma que **no puede mentir**: es el sha256
del `tokens.css` servido, más el commit que lo tocó por última vez. No es un campo que alguien
pueda olvidar subir.

## De tus cuatro reglas de movimiento, cubro dos

| regla | estado |
|---|---|
| el botón no cambia de ancho al ponerse ocupado | ✅ historia `Ocupado`, ambos estados con la misma etiqueta |
| nada cambia de tamaño al seleccionarse | ✅ historia con las mismas filas en dos columnas, seleccionadas y no |
| la dirección al retroceder | ❌ **no cubierta** |
| `prefers-reduced-motion` quita movimiento, no retroalimentación | ❌ **no cubierta** |

Las dos que faltan **no son capturables**: son comportamientos en el tiempo, y una captura fija
no las ve. Necesitan tests de interacción (`play`), no regresión visual. Lo digo en vez de contar
cuatro: dos verificadas a mano siguen dependiendo de que yo me acuerde.

## El defecto que encontré montándolo, y que era mío

La primera baseline **no era estable**: al restaurar un archivo sin cambios, siete capturas
seguían difiriendo por unos pocos píxeles. La causa era el `Spinner`, que sigue girando bajo
`prefers-reduced-motion` **a propósito** —es la única señal de que algo corre— así que cada
captura lo agarraba en otro ángulo.

Arreglado congelando animaciones en la captura. Un detector inestable no es un detector a
medias: es uno que la gente aprende a ignorar, y habría enterrado justo la clase de defecto
para el que existe.

Probado en negativo: cambié el padding del botón y dio **16 diferencias**; lo restauré y volvió
a verde. Un check que sólo se ha visto pasar no prueba nada.

## Una cosa que necesito de la primera corrida en CI

**La baseline tiene que nacer en CI, no en mi Mac.** Un runner de Ubuntu rasteriza las fuentes
distinto, así que una baseline local falla el día uno por algo que no es el CSS — y un check rojo
desde el primer día se apaga en una semana. Mismo criterio por el que `R6` espera.

Así que `test/visual-baseline/` va vacío con un README. La primera corrida genera las 52, las
sube como artefacto y **falla diciendo que no comparó nada**. Las bajo, las commiteo, y de ahí en
adelante compara.

## `R6` anotado donde no se pierde

En `docs/reports/`, con el criterio que aprobaste: entra cuando el vocabulario de movimiento esté
aplicado en toda la app, no antes. Hoy daría 22 fallos.
