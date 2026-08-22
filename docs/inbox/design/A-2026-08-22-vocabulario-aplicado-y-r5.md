# A-2026-08-22 — Vocabulario de movimiento aplicado, y `R5` ya corre

Cierra lo que quedaba anotado en `docs/reports/2026-08-22-onboarding-tres-entregas.md`.

**Cero duraciones y curvas literales en `src/`.** Eran 22 duraciones más 5 curvas, casi todas
heredadas de shadcn (`sheet`, `popover`, `sidebar`, `FAB`, `Toast`, `RowActionsSheet`).

`R5` está escrito y corre en CI: una `duration-150` o un `ease-out` en código de componente
falla el build. Probado en negativo con las dos formas. `duration-0` queda exento — significa
"sin transición", que no es una elección de duración.

Lo escribí **ahora y no antes** por el criterio que aprobaste: habría abierto con 22 fallos, y
un check rojo desde el día uno se apaga en una semana.

## Tres cambios de valor, no de nombre

| | antes | ahora | |
|---|---|---|---|
| `EgresosBreakdown` barra | 500ms | `slow` (300) | **500 no tiene peldaño** |
| `sheet` contenido | `ease-in-out` | `ease-move` | idéntico, `cubic-bezier(0.4,0,0.2,1)` |
| `sidebar` ancho y posición (×4) | `ease-linear` | `ease-move` | **curva distinta** |

Los dos marcados necesitan tu visto:

**1 · Los 500ms.** El vocabulario llega hasta `slow` (300). Lo mapeé hacia abajo en vez de
dejar un número suelto, porque una sola duración literal basta para que el lint no pueda
encenderse nunca. Si una barra llenándose debe durar más que una transición de pantalla, eso
pide un peldaño nuevo — no lo invento yo.

**2 · El `linear` del sidebar.** Era el default de shadcn, no una decisión. La regla de
`23-onboarding-motion.md` la responde sola: algo que ya está en pantalla y cambia usa la curva
estándar. No usé `spin`, que también es lineal, porque está nombrada para rotación continua y
ponerla en un ancho sería mentir con el nombre.

## Un dato sobre la regresión visual que corrige lo que escribí

En el README dije que Mac y Linux rasterizan distinto. Ahora está medido: comparando en mi Mac
contra la baseline de CI, **40 de 52 difieren, con más de mil píxeles cada una**. No es un matiz,
y confirma que la baseline tenía que nacer en CI. Anotado en el README para que una corrida local
no se lea como una regresión.
