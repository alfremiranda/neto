# A-2026-08-22 — Storybook v1 completo: las cuatro reglas, 35 historias, y publicado

Cierra el `DONE WHEN` de `TASK-2026-08-22-storybook-d1`.

## Las cuatro reglas de movimiento ya se verifican solas

Las dos que faltaban **no eran capturables**, así que no forcé una captura a hacer algo que no
puede: van en `scripts/motion-rules.mjs`, que conduce el flujo real.

| regla | dónde vive |
|---|---|
| el botón no cambia de ancho al ponerse ocupado | regresión visual |
| nada cambia de tamaño al seleccionarse | regresión visual |
| **la dirección se invierte al retroceder** | reglas de movimiento — mide el `translateY` en ambos sentidos |
| **`prefers-reduced-motion` quita movimiento, no retroalimentación** | reglas de movimiento — tres asertos |

La cuarta se partió en tres porque la regla tiene tres mitades: el spinner sigue girando, el
botón ocupado no cambia de ancho, y la columna pierde el desplazamiento pero conserva la
opacidad a `instant`.

Probadas en negativo, las dos: invertí la dirección de entrada y el chequeo dio
`adelante 8px · atrás 0.95px`; puse el spinner bajo `motion-safe` y dio `animación: ninguna`.

**Corren contra el servidor de desarrollo, no contra un build.** Los flags `?preview` están
atados a `import.meta.env.DEV` y se pliegan a `false` en cualquier cosa parecida a producción —
que es justo la garantía de que el fixture no viaja en el bundle. El único sitio donde esas
pantallas son alcanzables es el dev server, y decirlo es más honesto que aflojar la garantía
para poder testear.

## Cobertura

35 historias, 14 páginas. Añadido desde el último reporte: contenedores (`Card`, `SectionCard`,
`MetricCard`, `Empty`, `Skeleton`, `Separator`), campos (`MoneyInput`, `DatePicker`, `Select`),
y overlays (`Calendar`, `Tooltip`, `Popover`) **renderizados abiertos** — una historia que sólo
muestra el disparador no prueba nada, porque la superficie que importa es el panel.

**Sin cubrir, y a propósito:** `sheet`, `drawer`, `SheetBase`, `RowActionsSheet`, `sidebar` y
`Toast`. Son chasis de aplicación, no piezas del sistema: sus historias probarían sobre todo a
Radix y al store de UI, no una decisión de diseño. Si quieres alguna, dime cuál y por qué —
prefiero que lo pidas a inventarme el criterio.

## Publicado

**netofinanzas.app/storybook/**, dentro del mismo despliegue de la app. Alfredo no podía abrirlo
desde el celular, que es exactamente el problema: un sistema de diseño cuyo único visor es un
servidor local es uno que sólo Dev puede abrir.
