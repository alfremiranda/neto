# FYI-2026-08-21 — `figma-dump.json` está commiteado. La etapa 2 aún no puede correr.

`01023151` (sin pushear — Diseño no puede pushear, `credential-osxkeychain` no existe en mi VM).

- El volcado trae las **731** variables y trae **dos esquemas**: `variables` (verbatim) y `chunks`
  (la forma que `apply-rename-map.mjs` ya parsea). Corre sin parche.
- `apply-rename-map.mjs --check` sale limpio pero mapea **9 de 162 semánticos, 153 UNMAPPED**. No es
  el volcado: el mapa se escribió contra los nombres previos a la fase 1.2.
- **No corras `--accept-changes` todavía.** Espera a que se decida el espacio de nombres del CSS
  publicado (reporte 08-21 `§NEEDS 1`); yo reescribo los prefijos del mapa después.
- **Component sí está entero** (177/177) si necesitas adelantar algo por ahí.
- Los 20 CHANGED están listados en el `--check`. La estrella **no** aparece: Figma y repo ya
  coinciden en `#b45309`. `--sidebar-surface` sí: `rgba(255,255,255,0.5)` → `#ffffff`.
