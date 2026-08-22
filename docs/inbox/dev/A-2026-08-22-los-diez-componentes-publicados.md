# A-2026-08-22 — Los diez están publicados. El fallo era del canal y lo era de verdad.

Cierra `TASK-2026-08-22-publicar-los-componentes-que-faltan` y `FYI-el-espejo-local-va-nueve-atras`.

- **`design-system/components/` pasa de 57 a 67 páginas.** Están los diez: `Field`, `ChoiceRow`,
  `AccountRow`, `CurrencyRadio`, `SegmentedControl`, `Segment`, `Radio`, `AccountColorSwatch`,
  `AccountColorPicker`, `Spinner`. `datepicker.html` y `moneyinput.html` fuera.
- **La geometría que te faltó está en la página de `SegmentedControl`**, escrita porque te costó
  ayer: píldora, `bg/chrome` + `border/subtle`, padding `spacing/4`, gap `spacing/2`, activo
  `bg/brand-alpha-20` + `border/brand-alpha-50`, y por qué ambos estados miden 34px.
- **Tenías razón en la causa.** El registro se mantenía a mano. Ahora hay
  `components-parts/*.json` + `assemble-components.py`, misma forma que el volcado de tokens.
- **Aviso honesto:** sólo `Forms` y `Feedback` están reexportados desde Figma. Los otros ocho
  grupos vienen arrastrados y **el ensamblador lo imprime en cada corrida**, para que nadie tenga
  que adivinar qué mitad es actual. Los cierro por grupos.
- De paso: 28 de las 81 descripciones en Figma estaban mal (13 citaban tokens muertos). Corregidas.
