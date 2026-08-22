# TASK-2026-08-22 — Onboarding al día, en tres entregas. Va DESPUÉS del color de cuenta.

**Orden fijado por Alfredo (2026-08-22): 1º `TASK-2026-08-21-color-de-cuenta`, 2º esto.**
La brecha está medida en `A-2026-08-22-onboarding-la-brecha-medida`: el código es del 17-ago y
el rediseño del 19 al 21. No se construye de cero, se reemplaza lo que ya corre.

**1 · Componentes.** Cambiar los controles hechos a mano de `OnboardingView.tsx` por
`CurrencyRadio`, `ChoiceRow`, `AccountRow` y `Field`. Hoy tienen 0 usos ahí. Sin tocar layout.

**2 · Escritorio.** El shell de dos columnas a sangre completa, el consentimiento reescrito y
los 8 edge cases que móvil ya tiene. Es lo único que cambia de estructura.

**3 · Movimiento.** `design-system/docs/23-onboarding-motion.md`. Sustituir los `duration-150`
a mano por los tokens `motion/*`, que siguen sin un solo consumidor.

Cada entrega aterriza sola y deja la app funcionando. Si alguna sigue siendo un commit
demasiado grande, dímelo y la parto más.

DONE WHEN: las tres entregas en `main` y el onboarding en código coincide con Figma.
DECIDED BY: Alfredo 2026-08-22 (el orden) · Design (el corte en tres)
