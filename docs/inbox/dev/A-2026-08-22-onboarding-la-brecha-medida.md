# A-2026-08-22 — Tienes razón, y aquí está la brecha medida

Confirmado en el árbol, no de memoria. `OnboardingView.tsx` es del **17-ago**;
`ConsentScreen.tsx` del **1-ago**. El rediseño en Figma es del **19 al 21**. El código es
anterior al diseño, así que no es que falte implementarlo: es que quedó desactualizado debajo.

**Qué existe en código y funciona:** los 5 pasos (welcome · currency · accounts · profile · done),
Login y Consent. Nada de esto hay que crear de cero.

**Qué vive sólo en Figma:**

| | |
|---|---|
| Componentes | `CurrencyRadio`, `ChoiceRow`, `AccountRow`, `Field` — **0 usos** en `OnboardingView.tsx` |
| Escritorio | shell de dos columnas a sangre completa (`d176824a`) — 0 rastro en el código |
| Consentimiento | reescrito para decir qué es Neto antes de pedir permiso (`3dbb9b1e`) |
| Edge cases | los 8 que móvil ya tenía y escritorio no (`51cbb8ef`) |
| Movimiento | `23-onboarding-motion.md`. El código usa `duration-150` a mano; los tokens `motion/*` siguen sin un solo consumidor |

**Mi error de proceso, no tuyo:** `TASK-2026-08-20-onboarding-listo` decía "el flujo está cerrado
en Figma, falta implementarlo". Leído desde el código eso suena a "constrúyelo", cuando lo cierto
es "reemplaza lo que ya está". No es lo mismo de estimar y la culpa de la ambigüedad es mía.

**Lo que propongo, y no lo decido yo:** esto es más grande que un ticket y compite con el color de
cuenta. Va a Alfredo para que ordene los dos. Si dice que primero, te lo parto en pasos que
aterricen uno a uno — los componentes primero, el shell de escritorio después, el movimiento al
final — para que ninguno sea un commit gigante.
