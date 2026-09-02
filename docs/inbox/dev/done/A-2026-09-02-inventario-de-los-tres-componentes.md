# A-2026-09-02 — los tres componentes del flujo, medidos contra las instancias

Pediste esto y Alfredo lo pidió también: que quede claro qué son hoy `AccountCard`,
`AccountSummaryCard` y `AccountChart`. Medido sobre las variantes, no sobre las descripciones.

## `AccountCard` — `212:8761` · 12 variantes · `Type` × `State`

| | Hoy |
|---|---|
| header | `avatar · nombre · estrella` |
| nombre | `Body/Small-Emphasis`, **una línea con elipsis** (altura fija) |
| meta | `moneda | tipo | número` |
| alto | **120 en las 12** (antes 130 en Bank Account) |
| props | `Show Account Number` · `Show Favorite` |

**En el `.html`: sí.** `accountcard.html` está al día — de hecho fue donde tú encontraste la
verdad antes que yo.

El nombre **se trunca** a 220px y eso es lo publicado, no un descuido. La estrella sigue donde
estaba, al final del header.

## `AccountSummaryCard` — `379:12631` · 8 variantes · `Type` × `Device`

**No ha cambiado, y eso es la noticia.** Sigue con la línea corrida en la meta y **dos** métricas.
Ver la corrección al final de `TASK-2026-09-02-el-flujo-de-cuentas-y-lo-que-cambio`.

**En el `.html`: sí, refleja Figma.** Si tu build y el `.html` no coinciden, el `.html` manda.

Un detalle de su API que te va a morder si no lo sabes: **la propiedad `Title` está cableada solo
en las cuatro variantes `Device=Desktop`.** En Mobile el nombre es texto fijo, así que ponerle
`Title` a una instancia móvil no hace nada. Lo dejo señalado y sin tocar, porque es decisión de
Alfredo si se arregla.

## `AccountChart` — `379:12672` · **2** variantes · solo `Device`

Cambió hoy: **`Series` se borró** (ver `A-2026-09-02-series-dual-se-borra`). Ya no hay
`Single|Dual`. Un saldo negativo dibuja la deuda hacia abajo y toma el color de deuda; no hay
segunda serie.

El tooltip del chart en Figma ahora lleva un `TooltipReadout` real con el chip en
`readout/swatch/balance` — antes mostraba la frase por defecto, que es lo que te confundió.

**En el `.html`: sí.**

## Frames que quedaron atrasados

| Frame | Qué está viejo | Estado |
|---|---|---|
| `397:359` · Desktop detalle | papelera en la fila de saldo inicial | **corregido en el componente** |
| `397:359` | sidebar `Mes actual · Resumen anual · Configuración` | pintura vieja del mock, ignórala |
| `397:359` / `397:16540` | línea corrida en la meta | **NO está viejo** — es el diseño vigente |

## La regla que salió de esto

**El `.html` generado es el contrato, no mi prosa.** Hoy encontraste la verdad ahí dos veces y en
las dos yo estaba contando otra cosa. Cuando una nota mía y `design-system/components/*.html` no
coincidan, el `.html` gana y me lo dices — es exactamente lo que hiciste.

POINTER: design-system/components/accountcard.html, accountsummarycard.html, accountchart.html.
