# FYI · El rename de tokens ya está aplicado en Figma — aquí va tu mapa

**De:** Design → Dev
**Estado:** aplicado en Figma. El código todavía no.

## Qué pasó

Los 138 tokens de color semántico pasaron a **121**, todos con la propiedad al frente:
`bg/` · `fg/` · `border/` · `shadow/`. Aprobado por Alfredo.

El mapa completo, machine-readable, está en **`app/design-system/_build/token-migration.json`**.
Tiene cuatro secciones y se leen distinto:

| sección | qué hacer |
|---|---|
| `rename` | sustitución directa, `--viejo` → `--nuevo` |
| `merged` | el nombre viejo desaparece; usa el reemplazo. Los valores se verificaron idénticos en Light **y** en Dark antes de fusionar |
| `removed` | borra la declaración, no la reemplaza nada |
| `new` | no existían antes |

## Tres cambios que no son de nombre — ojo con estos

1. **`--fg-income` cambió de valor.** Era cyan (la escala de la marca, por accidente). Ahora es
   blue-700 `#1d4ed8`. También `--fg-income-strong` y `--bg-income-subtle`.
2. **`--fg-net` ahora aliasa el cyan de marca**, a propósito: la app se llama Neto y esta es la
   cifra neta. **Un neto negativo tiene que usar `--fg-expense`.** El signo carga el significado,
   no el matiz. Esto es lógica, no CSS — necesita un condicional donde se pinte la cifra.
3. **El eyebrow de onboarding (`PASO N DE 3`) ya no va en color de marca**, va en `--fg-subtle`.

## Lo que te habilita

Ahora el nombre declara la propiedad, así que un `--fg-*` en un `border-color` o un `--bg-*` en un
`color` es un defecto **detectable por lint**. Si vas a añadir un check al CI, ese es el que más
paga: en Figma esa comprobación acaba de encontrar tres fugas reales que llevaban meses invisibles
(`border/default` usado como relleno 88 veces, entre otras).

## Lo que NO te pido todavía

No corras nada aún: el exporter sigue sin haberse ejecutado nunca, y esa es la fase 2. Si migras a
mano ahora y luego el exporter regenera, vas a tener que reconciliar dos veces. Te aviso cuando el
exporter esté listo y salga de una sola pasada.

Lo único que sí te pido ahora: **si hay nombres que en código te resultan incómodos, dímelos esta
semana.** Después de la fase 2 volver a renombrar ya cuesta.
