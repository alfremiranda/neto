# TASK-2026-08-22 — D1: Storybook. El bloqueo cayó hoy.

TASK: montar Storybook como librería viva y detector de deriva. **Es lo siguiente que empiezas.**

## Por qué ahora y no antes

El 17-ago moví su bloqueo de A5/A6 al exporter, por una razón medida: una baseline de regresión
visual tomada sobre un artefacto derivado **certifica la deriva como correcta** y después lee cada
arreglo real como una regresión. Eso es peor que no tener detector, porque es uno en el que la
gente confía.

**Esa condición se cumplió con tu etapa 2.** Verificado en el árbol hoy, no citado de un reporte:

| | |
|---|---|
| Figma vs paquete publicado | **0 a 0** (`79839d99`) |
| `tokens.json` → `tokens.css` | 03:04 → 03:08 — generado, no mantenido a mano |
| colores definidos en `index.css` | **0** (`40e32cc9`, `R4` 49 → 0) |
| tokens de cuenta retirados que seguían pintando | **0** (`48607442`) |

Por primera vez hay una base fiel contra la cual hacer baseline.

## Condiciones, sin cambios desde que se escribieron

1. **Sólo componentes ya extraídos a código.** Si no, es un segundo dibujo y nacen dos SSOT.
2. **Regresión visual desde el día uno.** Sin eso es un catálogo; con eso es el detector que
   justifica el gasto.

## v1

Una historia por componente extraído con **todos** los estados que Figma especifica · los dos modos
y los dos `Device` como controles globales · regresión visual sobre esa matriz · cabecera que
muestre qué versión de `design-system/` está pintando — que **ahora sí puede decir algo**, porque
el paquete es reproducible.

Arranca sobre los ~24 componentes de `src/components/ui/`. Badges y filas se suman cuando lleguen.

## Lo primero que debe cubrir

`design-system/docs/23-onboarding-motion.md` está escrito en prosa **porque no hay dónde
ejecutarlo**, y tú acabas de verificar sus cuatro reglas a mano en el navegador. Esas cuatro son la
primera matriz: el botón que no cambia de ancho al ponerse ocupado · nada cambia de tamaño al
seleccionarse · la dirección al retroceder · `prefers-reduced-motion` quita movimiento pero **no**
retroalimentación. Hoy nadie las repite salvo tú, a mano.

## Y tu `R6`: aprobado, con la secuencia que propusiste

Un check que nace en rojo se apaga — hoy daría 22 fallos. **`R6` entra cuando el vocabulario de
movimiento esté aplicado en toda la app**, no antes. Es el mismo criterio por el que la compuerta
ΔE bajó de 25 a 18: una compuerta inalcanzable no es rigor, es ruido que la gente aprende a ignorar.
Anótalo donde no se pierda.

DONE WHEN: la matriz corre en CI · el spec de movimiento tiene sus cuatro tests · la cabecera dice
qué versión pinta. Diseño especifica historias; el montaje es tuyo.

DECIDED BY: orquestador 2026-08-22 — condición del 17-ago verificada como cumplida.
