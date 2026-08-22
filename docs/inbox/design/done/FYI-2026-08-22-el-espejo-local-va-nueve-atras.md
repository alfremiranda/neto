# FYI-2026-08-22 — Construí un SegmentedControl a mano porque el espejo local no lo tiene

Alfredo lo vio en un minuto: *"el componente del segmented control es diferente en Figma."*
Tenía razón, y la causa no es que no leyera el sistema — es que leí la copia equivocada.

## Qué pasó

Busqué "segmented" en `design-system/components/` y en `design-system/docs/`. **Cero
resultados**, así que lo construí desde el diseño anterior del código: contenedor
`radius/xl`, relleno sólido de marca en el segmento activo, texto blanco.

Lo que Figma tiene es otra cosa, y mejor:

| | lo que construí | `SegmentedControl` en Figma |
|---|---|---|
| radio | `radius/xl` | `radius/full` |
| contenedor | sin relleno | `bg/chrome` + `border/subtle` |
| padding · gap | 2 · 2 | `spacing/4` · `spacing/2` |
| segmento activo | relleno sólido de marca, texto blanco | **`bg/brand-alpha-20` + `border/brand-alpha-50`**, texto `fg/on-subtle` |

La diferencia que más importa es la última. Un segmento de marca sólida obliga a texto blanco
y convierte el control en lo más ruidoso de la pantalla, que está mal para un selector dentro
de un formulario. El lavado al 20% lo deja donde debe estar.

Ya está corregido y medido en el navegador: los seis valores coinciden exacto con Figma, y los
dos estados miden lo mismo (34px) porque el borde se dibuja siempre, transparente cuando no
está activo — si no, seleccionar mueve a los vecinos 1px.

## La causa de fondo: `design-system/components/` va nueve componentes atrás

Estas nueve existen en Figma y **no tienen página en el espejo local**:

    SegmentedControl · Segment · Field · ChoiceRow · AccountRow
    CurrencyRadio · AccountColorSwatch · AccountColorPicker · Radio

Son 57 páginas locales contra lo que hay en `Components · Forms` hoy. Es la misma causa que el
paquete de tokens congelado: `build.py` genera esas páginas desde `components.json`, y
`components.json` no se ha regenerado desde que empezaron a nacer componentes nuevos.

**Para mí eso no es cosmético.** El espejo local es lo primero que consulto —es lo que está en
el repo, es lo que puedo `grep`— y ahora sé que puede decir "no existe" sobre algo que sí
existe. Si un componente nuevo no aparece ahí, lo voy a construir a mano otra vez, y la próxima
vez quizá nadie lo note.

## Lo que propongo

Que `components.json` entre a la fase 2 junto con `tokens.json`. Si el exportador ya corre para
tokens, la misma pasada puede traer el inventario de componentes. Mientras tanto, **voy a
consultar Figma directamente antes de construir cualquier componente nuevo**, en vez de confiar
en el espejo — pero eso es un parche en mi proceso, no un arreglo del sistema.

## De paso

Convertí también el selector de "Tipo de ahorro" en `AccountEditSheet`, que era la última copia
hecha a mano del mismo control. Pasó de `role="group"` + `aria-pressed` a
`role="radiogroup"` + `aria-checked`: son tres opciones que forman **una** respuesta, y
"pressed" describe interruptores independientes.
