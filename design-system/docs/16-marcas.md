# 16 — Marcas de terceros

Creado 2026-08-19, al llevar a Figma la pantalla de entrada.

La pantalla de Login dibuja dos marcas ajenas, GitHub y Google. Parecen el mismo problema y
**no lo son**, y confundirlas cuesta caro en las dos direcciones: tokenizar la de Google es
apropiarse de un color que no es nuestro; sacar la de GitHub del sistema es perder un ícono que
sí se comporta como los demás.

## La prueba: ¿el color es del ícono o del contexto?

| | GitHub | Google |
|---|---|---|
| en código | un `path`, `fill="currentColor"` | cuatro `path`, `fill="#4285F4\|#34A853\|#FBBC05\|#EA4335"` |
| ¿hereda color? | **sí** | **no, nunca** |
| ¿tiene modo oscuro? | sí, el del contexto | **no**, es igual en los dos |
| dónde vive | `Icons` → `Icon Library`, glifo `github` | `Brand`, componente `brand-mark/google` |
| ¿tokenizado? | sí, como cualquier glifo | **no, a propósito** |
| `C1` | aplica | **exento** por `CONFIG.foreignBrand` |

**GitHub es monocroma y hereda `currentColor`.** Eso la vuelve un glifo normal: se ata a un
token de primer plano y se comporta como `check` o `chevron-right`. Verificado en el lienzo —
dentro de un botón relleno sale blanca sola, sin que nadie la sobrescriba.

**Google trae cuatro colores que no son nuestros.** Un token implica permiso de cambio, y aquí
no lo hay: las guías de marca de Google prohíben recolorear el logotipo. Escribirlos como
hexadecimales crudos no es descuido — es la única forma de decir *esto no se toca*. Por eso la
exención está en el validador y no en la memoria de nadie.

## Las banderas entran por la misma puerta (2026-08-19)

`CurrencyRadio` trajo el caso más puro de todos: **una bandera de país**. Amarillo, azul y rojo
de Colombia; el rojo, blanco y azul de Estados Unidos. No hay ninguna versión de esto en la que
tokenizarlos tenga sentido — no son nuestros, no tienen modo oscuro, y cambiarlos no es un
ajuste de diseño sino un error.

Por eso el set se llama **`brand-mark/flag`** y vive en `Brand`, junto al logo y a la marca de
Google. El prefijo hace todo el trabajo: los diez rellenos crudos de sus franjas quedan exentos
de `C1` por configuración, y **la exención viaja con la instancia** — al meter la bandera dentro
de `CurrencyRadio`, la instancia hereda el nombre del set y el chequeo la salta sin que haya que
tocar nada. Verificado: `CurrencyRadio` audita **77 nodos con cero violaciones**.

Es la prueba de que la regla estaba bien puesta en el nombre y no en una lista de nodos. La
tercera marca ajena no costó ninguna decisión nueva.

## La regla

> **Un color de marca ajena nunca sube a la capa de tokens.** Si el ícono hereda color, es un
> glifo. Si trae color propio, es una marca, vive en `Brand` bajo el prefijo `brand-mark/`, y
> queda exenta de `C1` por configuración.

El prefijo hace el trabajo: `CONFIG.foreignBrand = [/^brand-mark\//]` y `C1`/`C1b` saltan
cualquier nodo de ese subárbol. Añadir otra marca es nombrarla bien, no editar el validador.

## Cómo quedó la pantalla

- Login (móvil y escritorio, claro y oscuro): cada botón lleva su marca como ícono principal.
- Login · autenticando: el botón pulsado cambia la marca por el `Spinner`, que hereda el color
  de la etiqueta del botón — cabeza al 100%, pista al 25%. El otro botón conserva su marca y
  ambos quedan deshabilitados. Es exactamente el ternario de `LoginScreen.tsx:72,84`.

## Una trampa de la API que costó dos pasadas

Al copiar el paint de la etiqueta a la pista del spinner, **la opacidad se pierde en la primera
escritura**. Hay que escribir el paint y *después* volver a leerlo y reasignarlo con su
`opacity`. Es la misma familia que el color cacheado de `setBoundVariableForPaint`: el paint que
devuelves no es el paint que queda. Se detecta leyendo el valor después de escribirlo, nunca
asumiendo que la asignación cuajó.
