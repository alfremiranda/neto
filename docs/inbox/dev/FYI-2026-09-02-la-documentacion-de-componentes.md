# FYI-2026-09-02 — la documentación de componentes estaba desactualizada, 64 de 79

Alfredo me pidió que al actualizar un componente revise siempre su documentación. Lo medí antes
de arreglar nada, y no era un descuido mío de ayer: **64 de los 79 frames `doc:` no coincidían con
el componente que documentan.**

## Lo que estaba mal

- **Conteo de variantes falso en 8.** `Input` decía 24 y tiene 30. `AccountCard` decía 24 y tiene
  12. `income-itemrow` decía 2 y tiene 4; `outcome-itemrow` 4 y tiene 8; `Icon Account` 4 y tiene
  8. Esto no es cosmético: es la API del componente, y si la lees para implementar, implementas
  ejes que no existen.
- **Tamaño en px equivocado en ~40.** Esa línea (`4 variants · 1051 × 94`) medía el bounding box
  de la rejilla de variantes en Figma — o sea, cómo quedaron colocadas las previews, no el
  componente. Cambiaba cada vez que alguien movía una preview.
- **Prosa divergente en ~35.** El frame y la descripción del componente son dos copias del mismo
  párrafo, y editar una nunca tocaba la otra.
- **6 componentes sin spec.** `chart-range`, `ledger-itemrow`, `Progress`, `AccountAvatar`,
  `LedgerEntryIcon`, `LedgerContainer` — casi todos recientes, varios míos.

## Lo que hice

**Borré la medida en px**, del spec y de `build.py`. 40 de los 64 hallazgos eran solo esa línea, y
no le dice nada al lector que no vea. El conteo de variantes se queda: eso sí es la API.

**El spec ahora se deriva del componente** — ejes desde `componentPropertyDefinitions`, prosa
desde `description`. Ya no se escribe dos veces.

**Regla nueva en el auditor: `C10`.** Compara el spec contra su componente: conteo de variantes,
prosa idéntica, y prohíbe la medida en px. Corrido sobre el archivo: **79 revisados, 0 hallazgos.**

De paso apareció `topic:` como hermano de `doc:`. `AccountColor` documenta un asunto y contiene
dos componentes (swatch y picker), así que como `doc:` figuraba eternamente desviado. No lo
estaba: es otro tipo de página. `topic:` entra en el cromo de documentación igual que `doc:`.

## Lo que NO hice, y te toca saberlo

Hay una **tercera** copia de la misma prosa: el campo `d` de
`_build/components-parts/*.json`, que genera `components/*.html`. **39 de 89 entradas discrepan de
Figma, y en las dos direcciones.**

No la sobrescribí, y la razón importa: en 32 de esas 39 **el registro tiene el párrafo mejor** —
`Spinner` tiene cuatro párrafos ahí y uno en Figma; `breadcrumb` y `AccountColorSwatch` igual.
Generar desde Figma hoy borraría texto bueno. Otras 7 recortan a propósito la frase de ejes que el
HTML ya renderiza aparte, que es una mejora.

Queda como **`20-roadmap.md` §5.1b**: primero fusionar las 39 hacia Figma, después hacer `d` un
campo generado. Hasta entonces la regla la hace la mano (`00-principles.md` §A4.5) y seguirá
desviándose.

POINTER: design-system/_build/audit-figma.js (C10), design-system/_build/build.py (línea de
conteo), design-system/docs/00-principles.md §A4.5 · §A5 · §A6e, design-system/docs/20-roadmap.md
§5.1b.
