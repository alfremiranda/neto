# 13 — El mapa de renombres

> **La autoridad es `design-system/_build/rename-map.json`.** Este documento explica de dónde
> sale cada regla, qué decisiones hay dentro y qué queda sin cubrir. Si los dos difieren, gana
> el JSON: la prosa se degrada, el dato no (`00 §A7`).
>
> Es un **insumo autorado**, no una salida generada. El exportador (`TASK-2026-08-17-figma-exporter`,
> entregable D2) lo lee. Nunca debe deducirlo del output que ya existe: eso convertiría cualquier
> deriva actual en la especificación.
>
> **Derivado y verificado el 2026-08-17** contra `_build/tokens.json` y una lectura de las 214
> variables de color de Figma.

---

## 1. Por qué hace falta un mapa

Figma nombra por **intención dentro de una jerarquía** (`color/income/default`). El paquete
publica por **familia plana** (`--kpi-income-default`). Nadie eligió esa traducción dos veces: la
hizo un exportador que ya no existe en el repo, y su ausencia es la causa raíz de toda la deriva
medida en `12-arquitectura-estado.md §3.1`.

Reconstruirlo es lo que permite volver a generar `design-system/`. Sin el mapa, el exportador
tendría que inventar nombres — y **un nombre inventado se convierte en un token publicado que
nadie decidió.**

## 2. Component — regla única

`'--' + nombre.replace('/', '-')`. Sin excepciones.

**Verificado:** las 77 claves de componente del export salen exactamente de esa regla, con valor
idéntico en ambos modos en 75 de 77. Las 2 que difieren no son fallos del mapa sino los dos
valores en desacuerdo ya conocidos (`--sidebar-surface`, `--fav-selected-foreground`).

**15 variables más** existen en Figma y nunca se publicaron — las ocho `account-chart/*`,
`account-summary-card/icon/foreground` y las seis `breadcrumb/*`. Se adoptan con la misma regla,
sin decisión que tomar: son componentes construidos después del último export.

## 3. Semantic — prefijo reescrito, primera regla que casa

22 reglas en el JSON. **103 de las 111 claves semánticas del export salen de ellas con valor
idéntico en ambos modos, y hay 0 conflictos de valor.** Ese cero es lo que convierte el mapa en
una reconstrucción y no en una propuesta.

Las reglas no son arbitrarias, describen tres agrupaciones que el exportador original hacía:

- **Colapsa un nivel** cuando la jerarquía de Figma es más profunda que la familia publicada:
  `color/surface/sunken` → `--surface-sunken`.
- **Reagrupa por rol** cuando varias familias de Figma comparten destino: `color/danger/*`,
  `color/destructive/*` y `color/live/*` caen todas en `--status-*`; `color/feedback/*` y
  `color/brand/*` caen en `--surface-*`.
- **Renombra el concepto** en un solo caso: las cinco familias de cifra —`income`, `expense`,
  `provision`, `tax`, `net`— se publican como `--kpi-*`. Es el renombre que hizo creer que
  `kpi/*` no existía en Figma (`docs/reports/2026-08-17-token-drift-measured.md`).

### Las decisiones que tomé, y son mías

Cinco familias no tenían regla porque nunca se publicaron. Los prefijos son elección de Diseño:

| Figma | Clave | Por qué |
|---|---|---|
| `color/overlay/*` (14) | `--overlay-*` | Prefijo propio, **no** `--surface-*`. `color/surface/scrim` y `color/overlay/scrim` **son tokens distintos con distinto valor en oscuro**; colapsarlos al mismo prefijo los haría colisionar y uno ganaría en silencio. |
| `color/account/*` (3) | `--account-*` | El espacio de nombres queda libre al matar las ocho claves de slot (§4). Son el cuerpo neutro del chip, no su acento. |
| `account-accent/*` (6) | `--account-accent-*` | Coincide con el `codeSyntax` que ya llevan puesto en Figma. |
| `color/border/strong` | `--border-strong` | La regla de `border` ya lo produce; solo faltaba publicarlo. |
| `color/foreground/danger-inverse` | `--foreground-danger-inverse` | Igual. |

## 4. Las 8 claves huérfanas: **las ocho se matan, ninguna se adopta**

`--account-{1..4}-{surface,foreground}`. Cada una codifica un **slot de cuenta fijo** —ARQ,
Toptal, Bancolombia, "otra"— de antes de que Alfredo decidiera que el color de cuenta lo elige el
usuario. Ninguna tiene fuente en Figma; `--account-2-surface` (`#f5f3ff`) no coincide con ningún
valor del archivo. Adoptarlas sería volver a publicar un modelo muerto bajo nombres que ya no
significan nada.

Siete de las ocho llevaban meses invisibles porque **colisionan por valor con tokens vivos**: sus
píxeles coinciden con `currency/*`, `category/savings/*` o `color/account/*`, así que nada se veía
roto.

**El slot 4 es byte a byte `color/account/*`.** Esa es la migración barata:

| Hoy | Pasa a | Píxel |
|---|---|---|
| `--color-account-other-bg` | `--account-surface` | idéntico |
| `--color-account-other-txt` | `--account-foreground` | idéntico |

**El slot 2 no tiene equivalente y no debe tenerlo.** `Badge.tsx` cablea hoy un morado
"toptal": eso es el modelo muerto escrito en código. Bajo el modelo vigente, el matiz de una
cuenta sale del dato del usuario y se pinta con `--account-accent-<matiz>`, no de una clase por
nombre de cuenta.

**Precondición:** matar las ocho toca `src/**`, que es territorio de Dev. Reportado, no aplicado
(`00 §B3`) → `docs/inbox/dev/A-2026-08-17-rename-map.md`.

## 5. Lo que este mapa NO cubre

Decirlo importa más que la parte cubierta, porque un mapa que se cree completo hace que el
exportador invente lo que falta:

1. **Las 108 variables numéricas** (bloque `num`). Las de componente *parecen* seguir el mismo
   slug (`avatar/size/sm` → `--avatar-size-sm`), pero **no lo verifiqué clave por clave**. No lo
   asumas.
2. **Los 26 estilos de texto** (bloque `text`). Otra forma entera:
   `nombre|peso|tamaño|interlineado|tracking`.
3. `Primitives` y `Typography` no se publican y no necesitan mapa.

Los puntos 1 y 2 son una segunda pasada de Diseño, y son requisito para que el exportador
regenere `_build/tokens.json` completo. Hasta entonces el exportador puede emitir los cuatro
bloques de color y dejar `num` y `text` como están hoy.

## 6. Cómo re-derivar esto

Leer las variables de color de `Semantic` y `Component` con el resolvedor **por nombre de modo**
(nunca por índice — `00 §A5 T8`, y `12 §2`), aplicar las reglas del JSON, y comparar contra
`_build/tokens.json`. El resultado esperado hoy es: 103 cubiertas, 0 conflictos, 8 claves del
export sin regla — que son exactamente las ocho muertas.

Si esa comparación deja de dar 0 conflictos, **el mapa no es lo que está mal**: alguien cambió un
valor en Figma sin regenerar, o editó el output a mano.
