# Handoff · Diseño

Última actualización: **2026-08-21**. Trabajo en vuelo al cierre de sesión.

**`unpushed: 01023151` + el commit de `docs:` que trae este handoff** — Diseño no puede pushear. `credential-osxkeychain` es un binario de
macOS que no existe en la VM de Linux donde corro; `git fetch` funciona (lectura anónima),
`git push` no puede autenticar. Dev barre. Los cuatro commits que este archivo declaraba sin
pushear el 20 (`6afa685e`, `6cff971a`, `b19faabe`, `308f798c`) **ya están en `origin/main`**;
verificado con `git fetch`, no supuesto.

## Dónde quedó el roadmap

`design-system/docs/20-roadmap.md`, seis fases.

| fase | estado |
|---|---|
| 0 · instrumentar | ✅ `T8` a cero, `coherence-log.md`, `usage-census.js`, y la mitad de repo en CI (`validate-repo.mjs`, `R1`–`R4`) |
| 1.1 · mapa como dry run | ✅ `naming-map.json` + `naming-proposal.md`, revisado por Alfredo |
| 1.2 · aplicar en Figma | ✅ 138 → 121 tokens de color, renombrados, scopes derivados, `codeSyntax`, descripciones |
| 1.3 · escalas numéricas | ✅ Semantic 58 → 33, Primitives 43 → 30, **cero colisiones de nombre** |
| 1.4 · ocultar primitivas (`T2`) | ✅ `T2` 334 → 0, y las 203 vinculaciones directas que ocultaba bajaron a 57 (marcas y geometría de íconos, excepción estructural) |
| 2 · pipeline / exporter | 🟡 **etapa 1 corrida y commiteada** (`figma-dump.json`, 731 variables + 26 estilos). La etapa 2 espera una decisión, no un archivo — ver abajo |
| 3 · movimiento e interacción | ⬜ API de Motion verificada. `23-onboarding-motion.md` ya escrito. `bg/neutral-alpha-{10,20}` reservados para state layers. La escala de blur/spread se acuña aquí |
| 4 · componentes que faltan | ⬜ tres gráficos anuales, barra de distribución, `LedgerRow`, asa de drawer. `chart/*` reservado |
| 5 · mantenerlo vivo | ⬜ `C5`, `C6`, `C7` |

## Lo único que bloquea la fase 2

**No es el volcado. Es que `rename-map.json` apunta a nombres que la fase 1.2 retiró.**

El mapa se escribió el 19-ago contra `color/surface/*`, `color/foreground/*`, `color/income/*`.
La 1.2 renombró Semantic a property-first (`bg/*`, `fg/*`, `chart/*`). Resultado medido hoy con
`apply-rename-map.mjs --check`: **9 de 162 semánticos mapeados, 153 UNMAPPED** (el 17-ago eran 128
y **0**). `motion/` es el único prefijo que sobrevivió, y sobrevivió porque se añadió después.

La decisión está en `docs/reports/2026-08-21-exporter-etapa-1-fase-1.4-y-el-barrido.md §NEEDS 1`:
**(a)** el CSS publicado sigue a Figma (`--bg-*`, `--fg-*`; ~230 claves, migración en `src/`), o
**(b)** el mapa sigue traduciendo (cero trabajo en Dev, pero el paquete conserva
`--surface-wrap-*` y `--surface-popover`, los sustantivos de componente que Alfredo retiró).
Recomendación: **(a)**. No es mía la llamada.

Cuando esté decidida: reescribo los prefijos del mapa, Dev corre
`apply-rename-map.mjs --accept-changes` y `build.py` con los **20 CHANGED** a la vista. Los dos
diffs conocidos del 17 ya están resueltos — la estrella no aparece (Figma y repo coinciden en
`#b45309`) y `--sidebar-surface` va a `#ffffff`.

## Cómo se corre la etapa 1 (no es obvio, y por eso llevaba sin correrse)

Es una operación a dos manos: `figma-dump.js` corre **dentro del sandbox de Figma** (sin sistema de
archivos), `apply-rename-map.mjs` corre **local**. El relevo entre ambas no tenía dueño; ahora es de
Diseño y está escrito:

1. `use_figma` con el cuerpo de `figma-dump.js`, **por trozos**. El tope de 20 kB de la respuesta
   **no lanza error: corta**. Por eso el volcado del 17 tenía 220 filas y parecía completo.
2. Cada trozo se escribe verbatim a `_build/dump-parts/*.tsv`.
3. `python3 design-system/_build/assemble-dump.py` — aborta si una colección no trae exactamente
   162 / 41 / 177 / 351 filas. Es el único punto donde un trozo perdido falla ruidosamente.
4. El volcado publica **dos esquemas a propósito**: `variables` (registro verbatim, cuatro
   colecciones, tipos, alias, valor por modo) y `chunks` (la forma que la etapa 2 ya parsea).
   `chunks` lleva **sólo Semantic y Component**: la etapa 2 trata todo lo que no es Semantic como
   Component, y darle Typography o Primitives crearía 392 claves `--cmp-*` que nadie pidió.
5. **Los alias se siguen por NOMBRE de modo, nunca por índice.** Seguirlos por el modo por defecto
   del destino dejó 19 de 92 tokens de Component mal, y los otros 73 bien — un volcado a medias se
   lee como un desacuerdo de valor, no como un bug.

## Lo que un relevo tiene que saber antes de tocar Figma

- **`00-principles §B4` no es ceremonia.** Una pasada fría sub-reporta ~60% sin lanzar error.
  Ningún número se escribe si dos pasadas no coinciden.
- **`§A6` tampoco.** Cinco fallos de instrumento este mes, todos la misma forma: **muestrear un
  miembro y hablar por el conjunto.** `TEXT` por foreground · una coincidencia de cadena por un
  nombre de componente · un componente por los consumidores de un token · **una variante por una
  propiedad** (casi borra `SavingsCard :: Show Maturity`, vivo en `Type=CDT`) · una pasada por un
  conteo de archivo. Antes de un paso irreversible, la comprobación corre contra **todos** los
  miembros.
- **Los guards de borrado abortan, no avisan.** Tres veces evitaron daño real.
- **Un chequeo de tokens no reemplaza una captura.** `showShadowBehindNode` viene en `true`.
  Dos bugs de render de `doc: Field` los cazó una captura, no las propiedades.
- **`§A4` tiene cuatro cláusulas.** Un componente nuevo no está hecho hasta que pasa la auditoría,
  **vive dentro de su contenedor**, tiene marco `doc:` y el header está recomputado. Regla de
  Alfredo, y ya se rompió una vez (`Field` suelto al fondo de su página).
- **El ancho de borde se enlaza como cuatro claves por lado**, no como `strokeWeight`.
- **`_docs-kit` no es parte del sistema de diseño.** Es andamiaje de una skill de Alfredo.
- **El contenido de muestra con marcas es deliberado y correcto.** `§A3.8`. Sólo los placeholders
  son genéricos. Los ~390 nodos con marca fuera de onboarding no son un defecto que arreglar.

## Lo que espera decisión

| qué | de quién | dónde |
|---|---|---|
| espacio de nombres del CSS publicado — (a) o (b) | **Alfredo + Dev** | reporte 08-21 `§NEEDS 1` |
| `Frame 1` en `Components · Forms` (30 instancias de `Input` suyas) | Alfredo | pendiente desde el 20 |
| etapa 2 + `build.py` con los 20 CHANGED | Dev | reporte 08-21 `§NEEDS 2` |
| escala de blur/spread (dueño: Diseño, va a fase 3) | cola propia | `A-2026-08-20-fav-star §4` |
| Storybook | sigue bloqueado, medido peor que en agosto | `6afa685e` |
