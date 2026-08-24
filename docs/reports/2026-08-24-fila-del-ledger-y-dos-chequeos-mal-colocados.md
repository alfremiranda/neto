# 2026-08-24 — La fila del ledger, y dos chequeos que medían una fracción de lo que decían

Commits: `9c2cf26d`, `a59b5955`. Sin pushear (Diseño no puede; Dev barre).

---

## 1. Lo que se construyó

**`LedgerEntryIcon`** — la burbuja de 32px que abre cada fila del ledger. Seis tipos
(income · egreso · transfer-in · transfer-out · ss · scheduled) como **un swap anidado**, no
como un eje: ponerlos en la fila multiplicaría cada estado por seis para un dato que el
asiento ya trae.

**`ledger-itemrow`** — diez variantes sobre `Device × Flow × State`, siguiendo a las cinco
filas hermanas (`*-itemrow`) en vez de inventar una forma. Matriz rala a propósito:
`Confirming` es sólo Desktop, y **no hay `Pressed`** aunque las hermanas lo tengan, porque
esta fila no lo tiene en el código — el toque en móvil abre `RowActionsSheet` y no pasa
nada más.

Con las dos, la página de cuenta deja de estar bloqueada por diseño.

### Tres glifos que la librería no tenía

`arrow-down-left`, `arrow-up-right`, `shield-check`.

El primer intento estuvo **mal**, y vale la pena por qué: aplané un trazo sin convertirlo
antes a contorno. `flatten()` sobre un path con stroke colapsa el glifo a su geometría
desnuda. Resultado: **10×10 donde la referencia `arrow-left-right` es 18×20**, y de grosor
capilar en vez de 2px. No se vio en pantalla — se vio comparando el número contra la
referencia antes de construir nada encima. `outlineStroke()` y después `flatten()` da 12×12
y el peso correcto.

Es §A6 otra vez: el instrumento (una llamada que "funcionó" y devolvió un id) no dice nada
sobre si el resultado es correcto.

---

## 2. Un fallo de accesibilidad en el código

El glifo de seguridad social se pinta con `--color-tax`. Ese nombre resuelve a `bg/tax`,
que es **amber/400**, sobre `amber/50`: **1.61:1**.

Un glifo relleno es un objeto gráfico — le aplica **WCAG 1.4.11**, que pide 3:1. No pasa.
Figma usa `fg/tax` (amber/700, **4.84:1**); el nombre publicado es `--color-tax-txt`.

Los otros cuatro ya pasaban. Se midieron los cinco, en ambos modos, antes de construir:
income 3.58 · egreso 4.41 · transfer-in 6.16 · transfer-out 10.25 (Light); suelo Dark 5.84.
Sin esa medición el `ss` habría entrado a Figma con el mismo defecto que tiene el código.

Está en la descripción del componente como OPEN y en `TASK-2026-08-24` para Dev.

---

## 3. Los dos chequeos, que son el mismo error dos veces

La forma es idéntica: **la regla estaba a un nivel de donde le tocaba**, así que medía una
fracción de lo que declaraba medir.

### `C8` — tres exclusiones declaradas y nunca leídas

`docChrome`, `figmaChrome` y `outOfScopePages` se escribieron en `CONFIG` el 20-ago, con un
comentario que decía que el barrido de layout había dejado ~350 hallazgos de cromo de
documentación como falsos positivos permanentes.

**Ninguna de las tres la leía ninguna función.** La decisión existía sólo como prosa, dentro
de un objeto de configuración — que es exactamente donde uno lee una decisión y la da por
vigente.

Cableadas, una página pasó de 94 hallazgos a 12. Y los 12 eran reales: las doce variantes de
`AccountAvatar` llevaban un `padding: 10` en crudo mientras `spacing/10` ya existía.

Nótese la dirección del error: reportaba **de más**. Es la dirección sobrevivible — pero un
chequeo que nace con 350 falsos positivos es un chequeo que nadie corre, y eso es lo mismo
que no tener chequeo (§A5b).

### `C5` — la composición contaba como préstamo

Un nodo **dentro** de una instancia ya quedaba fuera. La instancia **misma** no. Así que
meter un `Badge` dentro de una fila contaba como pedir prestado `badge/*`.

Antes de tocar el chequeo se sondearon los 15 casos marcados en la página: los 15 traían el
token de su propio componente y **ninguno** tenía `fills` en `overriddenFields`. Cero
positivos reales en la clase. Con eso medido, la guarda.

`C5` fue **116 → 1 → 0** en todo el archivo. Los 115 retirados se leyeron, no se contaron:
cada `AccountSummaryCard` con un `Favorite`, cada `Sheet` con un `Button`, cada
`ExpenseContainer` con `action-chip`s. El único superviviente,
`bottom-nav-button ← sidebar`, es la fila del sidebar a ancho de móvil y entra en
`SHARED_FAMILIES` con su motivo.

Su trinquete se **borra**, no se pone en 0: un trinquete en cero sigue diciendo "esto estuvo
roto"; sin trinquete dice "este chequeo es absoluto", que es la verdad.

---

## 4. Lo más caro de la sesión: `R2` reconstruía 89 archivos y comparaba 2

`build.py` no puede escribir en su sitio en esta máquina. Corre con `DS_OUT=/tmp/dsout` y el
resultado **se copia a mano**. Una copia a mano copia lo que alguien recuerda.

`tokens/tokens.json` y `foundations/colors.html` llevaban **tres commits atrasados**. Seguían
con `account/green/accent` y `account/amber/accent` en los peldaños que midieron 3.01:1 y
2.91:1 — los valores que se subieron a rung 700 *precisamente porque fallaban* — y no tenían
ni el des-préstamo de `action-chip` ni el traslado de `currency/*`. `tokens/tokens.css`,
copiado en las mismas sesiones, estaba al día.

Nada lo detectaba, y el porqué es lo que hay que guardar:

- `token-drift.mjs` compara Figma contra `_build/tokens.json`, que es la **fuente**. Es
  estructuralmente ciego a lo que pasa aguas abajo.
- `R2` era el chequeo dueño de la otra mitad. Ya reconstruía el árbol entero en un temporal
  — y después comparaba `tokens.css` y `tokens.map.css` y paraba. Su propio comentario decía
  *"el sistema declara `design-system/` un artefacto generado; si una edición a mano puede
  sobrevivir ahí, esa declaración es un comentario y no un hecho"*, encima de código que
  medía el 2% de él.

`R2` ahora compara **los 89 archivos que emite `build.py`**, unidireccional, y **nombra cada
archivo desviado en vez de contarlos** — un número no dice qué token se quedó con el valor
viejo.

Se confirmó **en rojo antes de confiar en el verde**: se revirtió un solo valor de token y se
añadió un comentario a un HTML, y R2 nombró exactamente esos dos archivos.

---

## 5. Lo que la lista de fase 4 tenía mal

Dos de los cuatro ítems no existían como se describían, y sólo mirando Figma se veía (§B6):

- **el asa de drawer ya existía**, dentro de `Sheet`. Nunca fue un componente que faltaba.
- **la barra de distribución son dos cosas distintas.** La `DistribucionCard` de Figma tiene
  cuatro segmentos fijos; la del código (`EgresosCard.tsx:67`) dibuja un segmento por
  categoría y atenúa los demás al pasar por encima. Llamarlas un solo ítem escondía una
  brecha real detrás de un componente que ya existe.

Quedan los tres gráficos anuales y esa barra por categoría.

---

## 6. Lo que se repite

Tres veces esta semana, **colocar bien la regla retiró más hallazgos que perseguir los
hallazgos uno a uno**:

| mover | retiró |
|---|---|
| `currency/*` a Semantic | 51 préstamos de golpe |
| la guarda de `INSTANCE` en `C5` | 115 |
| cablear `docChrome` | ~350 falsos positivos |

Ninguna de las tres era alcanzable arreglando instancias. Está escrito como **§A6b** en
`00-principles.md`.

---

## Verificación

- Figma: `C1` 0 · `C1b` 0 · `C3` 0 · `C5` 0 (todo el archivo) · `C8` 0 en las dos páginas tocadas.
- Repo: `validate-repo.mjs` `R1`–`R5` verde, con `R2` ya comparando 89 archivos.
- Tokens: `ADDED 0 · CHANGED 0 · PENDING 0 · UNACCOUNTED 0`.
- Registro de componentes: 83 entradas, los dos nuevos exportados desde Figma y verificados
  carácter a carácter contra la descripción del nodo.
