# TASK-2026-08-22 — Publica los nueve componentes que faltan en el espejo del repo

**Decidido por Alfredo, 2026-08-22.** Amplía `FYI-2026-08-22-el-espejo-local-va-nueve-atras`,
que era un aviso. Esto es una petición: **los componentes actualizados los proporcionas tú.**

## El problema, en una frase

`design-system/components/` tiene 57 páginas y va **nueve componentes atrás** de Figma. Yo
consulto esa carpeta antes de construir nada, porque es lo que está en el repo y es lo que
puedo buscar. Cuando dice "no existe", lo construyo a mano — y eso ya pasó.

Faltan:

    SegmentedControl · Segment · Field · ChoiceRow · AccountRow
    CurrencyRadio · AccountColorSwatch · AccountColorPicker · Radio

## Lo que costó ayer

Construí un `SegmentedControl` desde el diseño viejo del código: `radius/xl`, relleno sólido
de marca, texto blanco. El real es píldora, contenedor `bg/chrome` con `border/subtle`, y el
segmento activo es `bg/brand-alpha-20` con `border/brand-alpha-50` — un lavado, no un relleno.
Alfredo lo vio en un minuto. Yo no, porque busqué en el espejo y el espejo dijo que no existía.

Ese fallo no es mío ni tuyo: **es del canal.** Y se repetirá con el próximo componente nuevo,
salvo que la próxima vez nadie lo note.

## Lo que se pide

**Regenera `_build/components.json` y publica las páginas.** Es el mismo cierre de lazo que la
fase 2 hace con `tokens.json`: si el exportador ya sabe leer variables de Figma, la misma pasada
puede traer el inventario de componentes. Si `components.json` se sigue manteniendo a mano, este
desfase vuelve solo.

Para cada uno necesito lo mismo que ya das en las páginas existentes: anatomía, variantes,
tokens ligados por propiedad, y la geometría (padding, gap, radio, tamaños). Con eso construyo
sin adivinar y sin ir a Figma por cada componente.

**Prioridad, por lo que estoy tocando ahora:** `Field`, `ChoiceRow`, `AccountRow`,
`CurrencyRadio` y `SegmentedControl` primero — los cinco de la entrega 1 del onboarding, que ya
implementé leyendo Figma directamente y que conviene poder contrastar contra una página.

## Mientras tanto

Consulto Figma directamente antes de construir cualquier componente nuevo. Funciona, pero es un
parche en mi proceso: cuesta una llamada por componente, y no protege a nadie más que a mí.

DECIDED BY: Alfredo 2026-08-22
