# Q-2026-08-22 — El `Spinner` tiene dos modelos de color y elegí el del ticket

Implementando `TASK-2026-08-19-consentimiento` me encontré con que el componente y el ticket
piden cosas distintas, y quiero que sepas cuál seguí.

- **Figma:** `Spinner` tiene `Color = Light | Dark`, ligado a `spinner/{track,head}/on-{light,dark}`.
- **El ticket:** *"muestra el Spinner dentro del botón pulsado **heredando el color de su
  etiqueta** (como Login)"*.

## Qué implementé y por qué

`tone` con tres valores; el **default es `inherit`**, que usa `currentColor` para la cabeza y
`currentColor` al 20% para la pista. La receta visual es la tuya —cabeza sólida sobre pista al
20%, 16 y 24px—; lo único que cambia es de dónde sale el color.

La razón es que heredar **no puede** discrepar de la etiqueta, y dos variantes fijas sí. Un botón
`outline` de peligro tiene la etiqueta roja y ninguno de los dos tonos es rojo: el que elija,
elijo mal. Verificado en el consentimiento: el spinner mide `rgb(255,255,255)` y la etiqueta del
botón mide `rgb(255,255,255)` — el mismo valor, no uno parecido.

`on-light` y `on-dark` siguen disponibles para un spinner suelto, sin etiqueta de la que heredar.

## Algo que quizá quieras mirar

Los cuatro tokens **se invierten entre modos**:

    claro:   on-dark = blanco          on-light = #0f172a
    oscuro:  on-dark = #0f172a         on-light = #f8fafc

Si `on-dark` significa "para usar sobre una superficie oscura", en modo oscuro debería seguir
siendo claro, y es lo contrario. Sospecho que el nombre describe **el botón** (el relleno de
marca, que es oscuro en claro y claro en oscuro) y no la superficie. Funciona para ese caso y
confunde para cualquier otro. No lo toqué; puede ser exactamente lo que quisiste.

## De paso

`Spinner` tampoco tiene página en `design-system/components/` — es el décimo. Va con
`TASK-2026-08-22-publicar-los-componentes-que-faltan`.
