# FYI · Onboarding listo para implementar, con el spec de movimiento

**De:** Design → Dev
**Estado:** el flujo está cerrado en Figma. Falta implementarlo.

## Está auditado, no solo terminado

Antes de decir "listo" pasé la auditoría sobre la página, porque `§A4` dice que terminado significa
eso:

| chequeo | resultado |
|---|---|
| `T9` — token usado contra la propiedad que su nombre declara | **0** |
| efectos sin token | **0** |
| strokes sin token | 4 |
| rellenos sin token | 544, **todos explicados** |
| números de layout crudos | 120, **todos fraccionarios** |

Los 544 asustan y no lo son: **400 son las estrellas de la bandera de EE.UU.** dentro de
`CurrencyRadio`, más sus franjas, el cantón, la bandera de Colombia y los cuatro colores de Google
en el botón de sign-in. Todos `brand-mark/*`, exentos por `CONFIG.foreignBrand` — una bandera
nacional y el logo de otra empresa no se tokenizan. El resto son tres fondos de `SECTION`, que es
cromo de canvas.

Los 120 números son fraccionarios (`1.8`, `7.8`, `2.88`, `12.48`): artefactos de grupos escalados,
no decisiones de nadie.

## El movimiento: `design-system/docs/23-onboarding-motion.md`

Está escrito para ejecutarse, no para inspirar. Cada duración y curva que aparece **ya es un token**
(`motion/duration/*`, `motion/easing/*`, minteados el 19 de agosto y hasta hoy sin usar).

La regla que genera todo lo demás, por si falta un caso: **lo que llega desacelera, lo que se va
acelera, lo que se queda usa la curva estándar.**

Tres cosas del spec que son las que se rompen en la práctica:

1. **El botón no puede cambiar de ancho** al entrar en estado ocupado. La etiqueta se va, el spinner
   es más angosto, el botón se encoge y el layout salta bajo el dedo justo cuando la persona espera
   saber si funcionó. Reserva el ancho antes del swap.
2. **Nada cambia de tamaño al seleccionarse.** Una lista donde el ítem seleccionado crece mueve a
   todos los demás, y el ojo sigue el movimiento en vez de la selección.
3. **`prefers-reduced-motion` quita movimiento, no retroalimentación.** Las opacidades se quedan en
   `instant`, y el `Spinner` se queda: es la única señal de que algo sigue corriendo.

## Lo que NO cambia

El primer pintado, el rail, el header, el logo, y el cambio de modo claro/oscuro. Están listados en
el documento a propósito: un spec que solo dice qué se mueve se lee como permiso para que se mueva
todo.

## Nota sobre Figma

La API de movimiento **sí está habilitada** en esta cuenta y cada marco del flujo ya tiene su
timeline. Podríamos especificarlo dentro de Figma y que lo leyeras con `get_motion_context`.
Alfredo prefirió el documento, y estoy de acuerdo con el criterio: verificar movimiento en Figma
exige `export_video`, que renderiza en servidor y es lento. Si al implementar algo del documento te
resulta ambiguo, dímelo y lo construyo en Figma para ese caso concreto.
