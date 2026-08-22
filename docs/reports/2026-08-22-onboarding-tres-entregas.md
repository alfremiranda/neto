# 2026-08-22 — Onboarding al día, las tres entregas

Cierra `TASK-2026-08-22-onboarding-al-dia-en-tres-entregas`.

DID:
- **Entrega 1** — los controles hechos a mano pasan a componentes del sistema: `Field`,
  `ChoiceRow`, `AccountRow`, `CurrencyRadio`, más `SegmentedControl` y `Spinner`.
- **Entrega 2** — shell de dos columnas en escritorio, consentimiento reescrito, y los casos
  límite verificados a 1440.
- **Entrega 3** — el vocabulario de movimiento, expuesto como utilidades y aplicado.

## DECISIONS

**El vocabulario antes que los usos.** `duration-fast` / `ease-enter` son ahora utilidades de
Tailwind ligadas a los tokens, así que escribir el token es más fácil que escribir `150ms`. Los
nueve estaban minteados desde el 19-ago **sin un solo consumidor**; ahora los consume el
onboarding entero.

**`Button` gana `busy`.** El spec llama a esto "the single most common way this goes wrong": la
etiqueta se va, el spinner es más angosto, el botón se encoge y la pantalla salta bajo el dedo
justo cuando la persona espera saber si funcionó. La etiqueta se queda en el layout e invisible;
el spinner se superpone. Medido: 206px antes y 206px después.

**Movimiento reducido quita movimiento, no información.** Verificado en los dos modos: con
`prefers-reduced-motion` el transform desaparece, la opacidad sobrevive a `instant`, y el
**spinner sigue girando** — es la única señal de que algo corre.

## FOUND — tres bugs que solo el navegador podía mostrar

**1 · Clases de Tailwind construidas por interpolación no existen.** Escribí
`` motion-safe:${back ? 'translate-y-2' : '-translate-y-2'} ``. Tailwind genera utilidades
escaneando el texto fuente, así que esa clase existe en tiempo de ejecución y **nunca existe en
la hoja de estilos**. Reescrito con literales completos.

**2 · `transition-[…]` también fija duración y curva.** No es solo una lista de propiedades: trae
150ms y la curva por defecto. Al llevar `motion-safe:`, se emite *después* de
`duration-slow ease-enter` y ganaba la cascada. Las clases estaban puestas y los valores se
ignoraban en silencio — medido 0.15s donde el spec pide 0.3s. Es la misma trampa que ya nos costó
con `.ts-*`: **una utilidad que pisa a otra es un bug, no una preferencia.**

**3 · `border-current/20` no es una utilidad.** El modificador de opacidad no aplica a
`currentColor`, así que la pista del spinner caía al color de borde por defecto en vez de al 20%
de la etiqueta. Resuelto con `color-mix`, que es como este proyecto ya deriva translúcidos.

Los tres pasaban `tsc`, pasaban el build y pasaban a la vista. Ninguno habría aparecido leyendo
el código.

## NEEDS

**Quedan 22 duraciones a mano en `src/`**, todas en primitivas de shadcn (`sheet`, `popover`,
`sidebar`, `RowActionsSheet`) y en `App.tsx`. Fuera del alcance de este ticket, que era el
onboarding. Convertí solo la del `Button` base porque `duration-100` es exactamente
`motion/duration/instant` y el cambio es de valor idéntico.

Propongo que sea un `R6` del validador cuando el vocabulario esté aplicado en toda la app: una
duración literal en `src/**` es detectable por lint, igual que `R1` con los hex. No lo escribo
todavía porque hoy daría 22 fallos y un check que nace en rojo se apaga.

**Storybook sigue siendo lo que falta de verdad.** El propio spec lo dice: cada regla suya es un
test de interacción esperando dónde vivir. Yo verifiqué las cuatro a mano en el navegador —el
ancho del botón, que nada cambia de tamaño al seleccionar, la dirección al retroceder, y los dos
modos de movimiento— y las cuatro son repetibles. Hoy nadie las repite salvo yo, a mano.
