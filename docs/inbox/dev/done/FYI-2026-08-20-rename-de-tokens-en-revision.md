# FYI · Viene un rename de tokens de color — no lo apliques todavía

**De:** Design → Dev
**Estado:** propuesta, nada aplicado en Figma

## Qué es

Medí las 138 variables de color de la colección Semantic contando bindings reales en el archivo
(no leyendo nombres). El resultado está en:

- `app/design-system/_build/naming-proposal.md` — para leer
- `app/design-system/_build/naming-map.json` — para automatizar
- `app/design-system/docs/21-token-naming.md` — la convención

Resumen: 138 tokens → 121. Los nombres pasan a llevar la propiedad adelante
(`bg/` · `fg/` · `border/` · `shadow/`), lo que hace que el *scope* de Figma y el `codeSyntax`
se deriven del nombre en vez de recordarse.

## Por qué te afecta

Cuando esto se aplique (fase 1.2 del roadmap) **cambian los nombres de todos los tokens de color
semánticos**, y por lo tanto los custom properties que salgan del exporter. La migración te la
entrego yo en la fase 2 como un mapa `viejo → nuevo` completo, no como una lista de "búscalo tú".

## Qué te pido ahora

1. **No renombres tokens a mano en `tokens.css`** mientras esto está en revisión. Si el archivo se
   mueve por debajo, el mapa deja de ser aplicable mecánicamente.
2. Si hay nombres de token que en código ya te resultan incómodos o ambiguos, dímelos ahora — este
   es el momento barato para incluirlos. Después de la fase 1.2 ya no lo es.

## Dos hallazgos que te sirven igual

- `color/border/focus` **nunca ha sido un borde**: cero strokes, doce sombras. Si en código lo
  estás usando como `border-color`, no está haciendo lo que crees.
- `color/interactive/primary` está pintando **tres** propiedades a la vez (fondo, borde y texto).
  Si alguna vez quisiste oscurecer el borde de un botón sin oscurecer el botón, esa es la razón
  por la que no se podía.

## Bloqueo real

Nada de esto avanza hasta que Alfredo apruebe la convención y las 19 eliminaciones. Te aviso.
