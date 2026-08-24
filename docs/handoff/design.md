# Handoff · Diseño

Última actualización: **2026-08-24**. Trabajo en vuelo al cierre de sesión.

**`unpushed: 9f785d10` · `49e9c272` · `897afebe` · `9c2cf26d` · `a59b5955` + el commit que trae
este handoff** — Diseño no puede pushear. `credential-osxkeychain` es un binario de macOS que no
existe en la VM de Linux donde corro; `git fetch` funciona (lectura anónima), `git push` no puede
autenticar. Dev barre.

Los cinco que este archivo declaraba sin pushear el 21 (`01023151`, `eedb39a8`, `0fd773be`,
`d9555237`, `71df9e46`) **ya están en `origin/main`**; verificado con `git fetch` y
`git merge-base --is-ancestor`, no supuesto.

## Cómo le respondo a Alfredo (2026-08-21)

Pocas palabras, frases concretas, sin explicación técnica. **Alfredo no es developer.**
Qué cambió y qué significa para la app — no cómo funciona por dentro. El detalle técnico va
a los docs, a los mensajes de commit y a la bandeja de Dev, no a la conversación.

## Dónde quedó el roadmap

`design-system/docs/20-roadmap.md`, seis fases.

| fase | estado |
|---|---|
| 0 · instrumentar | ✅ `T8` a cero, `coherence-log.md`, `usage-census.js`, y la mitad de repo en CI (`validate-repo.mjs`, `R1`–`R4`) |
| 1.1 · mapa como dry run | ✅ `naming-map.json` + `naming-proposal.md`, revisado por Alfredo |
| 1.2 · aplicar en Figma | ✅ 138 → 121 tokens de color, renombrados, scopes derivados, `codeSyntax`, descripciones |
| 1.3 · escalas numéricas | ✅ Semantic 58 → 33, Primitives 43 → 30, **cero colisiones de nombre** |
| 1.4 · ocultar primitivas (`T2`) | ✅ `T2` 334 → 0, y las 203 vinculaciones directas que ocultaba bajaron a 57 (marcas y geometría de íconos, excepción estructural) |
| 2 · pipeline / exporter | ✅ **cerrada 21-ago.** Etapas 1 y 2 corridas, paquete regenerado, `validate-repo` verde. El auditor da **ADDED 0 · CHANGED 0**: Figma y el paquete coinciden por primera vez |
| 3 · movimiento e interacción | ⬜ API de Motion verificada. `23-onboarding-motion.md` ya escrito. `bg/neutral-alpha-{10,20}` reservados para state layers. La escala de blur/spread se acuña aquí |
| 4 · componentes que faltan | 🟡 **`LedgerEntryIcon` y `ledger-itemrow` hechos el 24-ago**, con tres glifos nuevos. Quedan los tres gráficos anuales y la barra de distribución por categoría. Dos ítems de la lista original estaban mal: el asa de drawer **ya existía** dentro de `Sheet`, y la barra del código no es la `DistribucionCard` de Figma. `chart/*` reservado |
| 5 · mantenerlo vivo | 🟡 `C5` `C6` `C7` `C8` en pie. `C5` llegó a **0 y perdió su trinquete**. `R2` pasó de comparar 2 archivos a comparar los 89 que genera `build.py` |

## Fase 2: resuelto el 21-ago. Cómo quedó

**El bloqueo no era el volcado: `rename-map.json` apuntaba a nombres que la 1.2 retiró.**
Alfredo decidió que el CSS publicado sigue a Figma, así que la tabla de prefijos ya no existe.
**El nombre publicado es ahora función pura del nombre de Figma** (`--` + nombre, `/`→`-`) y
`token-ledger.json` guarda sólo lo que una función no puede saber. Contrato completo en
`design-system/docs/24-token-sync.md`; el auditor es `node design-system/_build/token-drift.mjs`
y **corre al abrir cada sesión, antes de tocar nada** (`00-principles §B6`).

Lo que queda medido, no estimado: **1 consumidor en `src/`** y **53 en `build.py`**. 120 alias,
75 de ellos ya retirables. Historia de por qué pasó:

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
| ~~espacio de nombres del CSS publicado~~ | **decidido por Alfredo 08-21: sigue a Figma** | `24-token-sync.md` |
| ~~los 8 `--account-{1..4}-*`~~ | **decidido 08-21: mueren.** El color pasa a ser elección del usuario | `docs/25-account-color.md` · siguen en `pending` hasta que Dev repunte `build.py` 109-112 |
| la fila `destructive` del mapa de migración: ¿la aplicó Dev? | Dev | `Q-2026-08-21-la-fila-destructive` |
| `Frame 1` en `Components · Forms` (30 instancias de `Input` suyas) | Alfredo | pendiente desde el 20 |
| migrar los 132 nombres viejos a su ritmo (75 ya sin consumidores) | Dev | `token-drift.mjs` → RETIRABLE |
| repuntar `build.py` 109-112 y matar la cuarentena | Dev | `TASK-2026-08-21-color-de-cuenta` |
| escala de blur/spread (dueño: Diseño, va a fase 3) | cola propia | `A-2026-08-20-fav-star §4` |
| Storybook | sigue bloqueado, medido peor que en agosto | `6afa685e` |

## Mi propia cola (no bloquea a Dev)

Tres respuestas del orquestador siguen en mi bandeja **a propósito**: archivarlas habría sido falso.

- `A-2026-08-19-elevacion-ejecutada` — falta `C7` (el equivalente de `C1` para efectos) y el peldaño
  de elevación en Login / Bienvenida / Listo.
- `A-2026-08-19-tone-action-chip-c5-c6` — `action-chip` acuñó 3 de sus 6 vinculaciones prestadas;
  `C5` y `C6` no están en `audit-figma.js`.
- `A-2026-08-20-count-16-y-currency` — `currency/*` sigue en Component, aprobado su ascenso a Semantic.
