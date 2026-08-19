# FYI-2026-08-19 — `CurrencyRadio`: componente nuevo y cambio de forma en el paso Moneda

Alfredo dibujó el componente; yo lo saneé, lo documenté y lo apliqué. No hay nada que decidas —
esto es para que no te sorprenda cuando llegue la extracción.

## Qué es

`CurrencyRadio`, en `Components · Forms`, con documentación propia. Tarjeta de elección de
moneda: bandera, código de tres letras, nombre largo y el `Radio` del sistema dentro.

- **Ejes:** `State` (Default · Hover · Focused · Disabled) × `Selected` (False · True) = 8 variantes.
- **Texto por propiedad:** `Currency` y `Currency Description`. El componente no sabe de monedas;
  sabe que hay un código corto y un nombre largo.
- **Tamaño natural** 352 × 168, pensado para ir a `FILL` dentro de una fila de dos.

`Focused` y `Selected` son ejes distintos **a propósito**: se puede estar enfocado sin haber
elegido, y el anillo no sustituye a la selección. Al implementarlo, `:focus-visible` y
`aria-checked` son cosas separadas y las dos tienen que verse a la vez.

## Qué cambió en pantalla

Las **ocho** pantallas del paso Moneda (móvil y escritorio, claro y oscuro, base y el caso «USD
principal») dejaron de usar tarjetas dibujadas a mano y ahora instancian el componente. La
diferencia visible es la bandera y una tarjeta más alta (168 contra ~100).

La bandera no es adorno: en una app que muestra dos monedas a la vez es lo que se reconoce antes
de leer, y sostiene el reconocimiento mientras el código de tres letras todavía no significa nada
para quien acaba de entrar.

## La bandera no se tokeniza. Nunca

Vive en **`brand-mark/flag`** (página `Brand`), con `Country = Colombia | USA`. Sus colores son
de un Estado, no nuestros: van crudos y **exentos de `C1` por configuración**, igual que la marca
de Google. En código eso significa **no** meterlos en `tokens.css` ni derivarlos de la paleta:
son un SVG con sus hexadecimales y punto. Razonamiento en `design-system/docs/16-marks.md`.

## Dos cosas que corregí de paso

1. **La capa `Container`** dentro del componente disparaba `C4` (nombre genérico) en las ocho
   variantes. Renombrada a `identidad`. El componente ahora audita **77 nodos, cero violaciones**.
2. **El contador del encabezado de `Components · Forms` estaba desfasado**: decía «10 components ·
   79 variants» cuando lo medido era 12 y 93 — y ya estaba mal *antes* de que yo añadiera nada.
   Es el mismo patrón que reporté con los otros encabezados: son números derivados mantenidos a
   mano, y derivan. Esta vez lo escribí midiéndolo en vez de sumándole uno al anterior.

## Nombre

Lo renombré de `Currency Radio Button` a **`CurrencyRadio`**: `CurrencyBadge` ya existe en el
archivo con esa forma, y «Button» sobraba en algo que no es un botón. Si Alfredo prefiere el
nombre original, es un renombre de un campo y las instancias lo siguen solas.
