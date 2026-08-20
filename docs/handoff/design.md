# Handoff · Diseño

Última actualización: 2026-08-20. Trabajo en vuelo al cierre de sesión.

## Dónde quedó el roadmap

`design-system/docs/20-roadmap.md`, seis fases.

| fase | estado |
|---|---|
| 0 · instrumentar | ✅ `T8` a cero, `coherence-log.md`, `usage-census.js` |
| 1.1 · mapa como dry run | ✅ `naming-map.json` + `naming-proposal.md`, revisado por Alfredo |
| 1.2 · aplicar en Figma | ✅ 138 → 121 tokens de color, renombrados, scopes derivados, `codeSyntax`, descripciones |
| 1.3 · escalas numéricas | ✅ Semantic 58 → 33, Primitives 43 → 30, **cero colisiones de nombre** |
| 1.4 · ocultar primitivas (`T2`) | ⬜ **siguiente**. 344 primitivas visibles. Ya no bloquea nada (1.3 resolvió las colisiones en la raíz) pero sigue siendo ruido en el picker |
| 2 · pipeline / exporter | ⬜ **bloqueada en Dev**. El exporter nunca ha corrido |
| 3 · movimiento e interacción | ⬜ API de Motion verificada como habilitada. `bg/neutral-alpha-{10,20}` reservados para state layers |
| 4 · componentes que faltan | ⬜ tres gráficos anuales, barra de distribución, `LedgerRow`, asa de drawer. `chart/categorical/*` y `chart/sequential/*` están reservados para esto |
| 5 · mantenerlo vivo | ⬜ `C5`, `C6`, `C7` |

## Lo que está en vuelo ahora mismo

1. **Los 3.328 números de layout a mano.** Aprobado por el orquestador en
   `A-2026-08-20-numeros-de-layout`: barrer los 2.624 con token exacto en orden `Foundations` →
   `Components · *` → resto, **como fase con entrada en el log**, no como barrido único. La
   exclusión de `Screens · Neto (WIP)` va **en el `CONFIG` del validador**, no en silencio.
2. **`radius 10`.** No es todavía una pregunta para Alfredo. Hay que partir los 157 por página
   primero; los que caigan en `Screens · WIP` no cuentan como argumento. Si lo que queda en
   `Foundations` / `Components · *` / `_docs-kit` sigue siendo material, **es un peldaño que falta**
   y va a Alfredo con la cifra en la mano.
3. **Grosores fraccionarios.** Redondear al peldaño cuando el trazo es cromo; dejarlos donde son
   geometría de un ícono importado. La excepción va **estructural en el validador**.

## Lo que un relevo tiene que saber antes de tocar Figma

- **`00-principles §B4` no es ceremonia.** Una pasada fría sub-reporta ~60% sin lanzar error. El
  20 de agosto: 4.183 bindings en frío contra 10.108 convergido. Ningún número se escribe si dos
  pasadas no coinciden.
- **Los guards de borrado abortan, no avisan.** Tres veces evitaron daño real: cuatro tokens de
  Component aliasando tokens de la lista de borrado, 14 swatches todavía enlazados, y `badge/size`
  aliasando `size/20`.
- **Un chequeo de tokens no reemplaza una captura.** El anillo de foco de `ChoiceRow` medía
  correcto y renderizaba cyan sólido: `showShadowBehindNode` viene en `true` por defecto.
- **Tres chequeos mecánicos ya fallaron** y están registrados con el motivo en las Reglas 10 y 11 y
  en `naming-analysis.js`. No los reconstruyas.
- **El ancho de borde se enlaza como cuatro claves por lado**, no como `strokeWeight`.

## Lo que espera decisión

Ver `NEEDS` en `docs/reports/2026-08-20-fases-0-1-3-rename-de-tokens.md`. Resumen: `bg/container`
(Alfredo), `currency/*` a Semantic y la familia de `action-chip` (orquestador), y el exporter (Dev).
