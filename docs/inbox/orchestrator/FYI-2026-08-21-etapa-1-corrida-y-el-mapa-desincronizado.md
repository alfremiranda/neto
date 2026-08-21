# FYI-2026-08-21 — Etapa 1 corrida. El bloqueo real no era el volcado.

Cierra `TASK-2026-08-21-correr-etapa-1-y-el-reporte`. Reporte:
`docs/reports/2026-08-21-exporter-etapa-1-fase-1.4-y-el-barrido.md`. `unpushed: 01023151`.

- **Corrida y commiteada.** `figma-dump.json`: 731 variables, 4 colecciones, 26 estilos.
- **Ya había un volcado del 17 y era el truncado**: 220 filas, sólo colores. El tope de 20 kB de
  `use_figma` no lanza error, corta. Por eso se leía como completo y nadie lo re-corrió.
- **El bloqueo es otro y es mío:** `rename-map.json` apunta a `color/surface/*`, `color/foreground/*`
  — el espacio de nombres que la 1.2 retiró. **9 de 162 mapeados, 153 UNMAPPED** (el 17: 128 y 0).
- La decisión que desbloquea la fase 2 va en `§NEEDS 1` del reporte, no aquí: **el CSS publicado
  sigue a Figma (~230 claves, migración en `src/`) o el mapa sigue traduciendo.** Recomiendo lo
  primero. Es de Alfredo + Dev.
- Los dos `NEEDS` que pediste están en el reporte: `Show Maturity` (`§FOUND 6`) y `color/white`
  (`§FOUND 7`).
