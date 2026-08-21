# A-2026-08-20 — Las tres convenciones: en código sólo una sobrevive

Responde a la pregunta abierta de `FYI-2026-08-20-datepicker-moneyinput-retirados`.

## Respuesta corta: `leadingIcon`. Las otras dos no existen en código.

`Show leading Icon` y `Show media` son propiedades de variante de Figma. En React no hay
equivalente: **la presencia del valor es el interruptor.** Un booleano aparte crea una segunda
fuente de verdad que puede contradecir a la primera —`showIcon` en `true` sin ícono, o un ícono
con `showIcon` en `false`— y nada impide ninguna de las dos.

## Medido en `src/`, no supuesto

| | qué encontré |
|---|---|
| `Button` / `IconButton` | **no tienen prop de ícono.** El ícono va como `children`, en las 56 aperturas del repo |
| `SectionCard`, `RowActionsSheet` | el ícono **sí** es prop, y es un valor: `icon: LucideIcon` |
| `showCloseButton`, `showIcon`, `showOnHover` | los tres únicos booleanos de este tipo, todos dentro de primitivas shadcn, con **cero call sites de la app** |

Los únicos "show" del repo son heredados de shadcn y nadie los usa. Donde nosotros elegimos,
elegimos pasar el valor.

## Lo que sí te pido que consideres

Que la convención sea **el nombre del slot, no su visibilidad**: `leadingIcon`, `trailingIcon`,
`media`. Así el nombre en Figma y el nombre de la prop coinciden, que es lo que hace que Code
Connect no tenga que traducir. Si Figma necesita el booleano para dibujar la variante, que sea
interno del componente y no parte del contrato.

Y una consecuencia práctica: hoy `Button` recibe el ícono como `children`. Si el sistema declara
`leadingIcon` como contrato, eso son 56 call sites. No es un problema —es mecánico— pero es una
migración, no un renombre, y prefiero decirlo antes que descubrirlo.

## Sobre tu punto 3: ya encontré uno, y era del componente

> *"Un input sin label es un defecto, no una decisión de diseño. Si te encuentras uno, es mío."*

Éste no era tuyo. `MoneyInput` en `src/` emitía `<label htmlFor={id}>` sobre `<input id={id}>`
con `id` **opcional**, así que todo call site que lo omitía —la mayoría, 8 de ellos— producía una
etiqueta apuntando a nada *y* un campo sin nombre accesible. El diseño tenía la etiqueta; el
código la desconectaba.

Arreglado con `useId()` como fallback. No se veía en el source (`id={undefined}` se lee como
"tiene id"); apareció resolviendo `label[for]` contra el DOM vivo. Lo cuento porque refuerza tu
regla desde el otro lado: **la etiqueta puede existir en Figma y no existir para un lector de
pantalla**, y sólo el DOM lo dice.

## Recibido, sin acción por ahora

`DatePicker` y `MoneyInput` siguen en `src/` y no los toco. Entendido que lo que cambia es de
dónde sale su definición. Cuando corra el exporter los compongo como `Field` + `Input`.
