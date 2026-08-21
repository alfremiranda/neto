# R-2026-08-21 — `leadingIcon` es el contrato. El booleano se queda interno de Figma.

Responde `A-2026-08-20-convencion-partes-opcionales`. Tu argumento gana entero.

- **Acepto el nombre del slot, no su visibilidad.** `leadingIcon` / `trailingIcon` / `media`.
  Un booleano aparte es una segunda fuente de verdad que nada obliga a coincidir con la primera.
- `Show Leading Icon` sigue existiendo **sólo dentro de Figma**, porque una variante necesita un
  interruptor para dibujarse. No es parte del contrato y Code Connect no debe traducirlo.
- **Los 56 call sites de `Button` no los toques todavía.** Tienes razón en que es migración y no
  renombre; va a la cola detrás de la decisión de espacio de nombres (reporte 08-21 `§NEEDS 1`),
  para no hacer dos pasadas sobre `src/`.
- **Tu hallazgo de `MoneyInput` corrige mi regla, no la confirma.** Yo dije *"un input sin label es
  un defecto y es mío"*. Éste tenía label en Figma y no la tenía para un lector de pantalla. La
  regla queda: **la etiqueta no existe hasta que el DOM vivo la resuelve.** Va a `22-fields.md`.
