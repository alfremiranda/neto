# Phase 1.1 · Token rename — proposal for review

**Nothing has been applied.** This is the dry run. Phase 1.2 applies only what is approved,
and it is the one step in the roadmap that cannot be undone cheaply.

Machine-readable version: `naming-map.json` · Convention: `../docs/21-token-naming.md`

---

## The measurement

Every number below was produced by `naming-analysis.js` and is reported only because two
consecutive passes agreed (`00-principles §B4`). The first pass counted **4183** bindings;
the converged answer is **10108**. A single pass would have under-reported by 59% without
raising an error — which is the whole reason the rule exists.

| | |
|---|---:|
| Semantic colour tokens | **138** |
| Bound on a product screen | **48** |
| Bound only in documentation swatches | **58** |
| Bound nowhere at all | **32** |
| Groups of tokens holding an identical value | **29** |

**65% of the semantic colour collection does not appear on a single product screen.**

---

## Three findings that decide the shape of the rename

### 1 · `color/border/focus` is not a border

| bindings as stroke | bindings as effect |
|---:|---:|
| **0** | **12** |

It is the focus ring shadow, and always has been. The name has been wrong since it was
created and nothing in the system could tell us, because nothing derives scope from the
name. → becomes **`shadow/focus`**.

### 2 · `color/interactive/primary` is doing three jobs

| fill | stroke | text |
|---:|---:|---:|
| **234** | **185** | **18** |

437 bindings that cannot move independently. Darkening the button border today means
darkening the button. It splits into `bg/brand`, `border/brand-strong` and `fg/brand` —
all keeping `#0e7490`, so the split is visually free.

### 3 · `/default` means the opposite thing in adjacent families

| token | what it actually paints |
|---|---|
| `color/tax/default` | solid **background** (14 fills) |
| `color/net/default` | solid **background** (14 fills) |
| `color/income/default` | **text** (4 text bindings) |

Same suffix. Opposite property. Sibling families. This is the clearest single argument for
putting the property first.

---

## What happens to each token

### Renamed in place — 57 tokens

The bulk of the work. A few worth flagging:

| from | to | why it is not just cosmetic |
|---|---|---|
| `color/wrap/card` | `bg/surface` | "card" is a component; the token is a role |
| `color/foreground/subtle` | `fg/subtle` | ⚠️ 28 of its bindings are **strokes** — they move to the new `border/subtle` |
| `color/border/default` | `border/default` | ⚠️ 88 of its bindings are **fills** on 1px shapes. Audit item, not a rename |
| `color/overlay/brand` (10%) | `bg/brand-subtle` | |
| `color/interactive/primary-overlay-subtle` (20%) | `bg/brand-muted` | it is currently called *subtle* while being the **stronger** of the two |

### Split — 5 tokens become 12

`color/interactive/primary` → `bg/brand` · `border/brand-strong` · `fg/brand`
`color/foreground/placeholder` → `fg/placeholder` · `fg/disabled` *(the Component collection
already aliases it as `disabled` — two contracts sharing one value by accident)*
`color/expense/default` → `fg/expense` · `bg/expense`
`color/provision/default` → `fg/provision` · `bg/provision` *(14 / 14 — a dead-even tie)*
`color/income/default` → `fg/income` · `bg/income`

### Merged — 9 tokens collapse into 6

`wrap/container` → `bg/canvas` · `foreground/on-card` + `on-popover` → `fg/default` ·
`surface/raised` + `surface/elevation/raised` → `bg/raised` · `surface/sunken` +
`interactive/secondary` → `bg/subtle` · `danger/default` → `fg/danger` ·
`danger/surface` → `bg/danger-subtle`

⚠️ **Four of these are marked PENDING in the map.** They are identical in Light mode, which
is not sufficient — elevation is often carried by fill in Dark and by shadow in Light. The
Dark values get checked before any merge is applied.

### Deleted — 19 tokens

Duplicates and dead weight. The one worth reading:

> **`color/brand/default` and `color/brand/emphasis` are not the brand colour.**
> They hold sky blue — `#e0f2fe` and `#0284c7`. Neto's brand is cyan, `#0e7490` / `#06b6d4`.
> Nothing binds them, so nothing ever broke. The name was simply never true.

### Reserved — 19 tokens kept deliberately unused

`color/categorical/1-5` → `chart/categorical/*` and `color/sequential/1-5` → `chart/sequential/*`
are unbound because the three annual charts and the distribution bar are **Phase 4**.
Deleting them means re-minting them in six weeks.

`account-accent/*` is unbound in five of six hues because the mocks contain one account. It
is the palette a user picks from — absence of use is not absence of purpose.

Three overlay tokens (`hover`, `pressed`, `selected`) survive because the translucent state
layer is what **Phase 3** will need for states on coloured surfaces. The other nine overlays go.

### New — 2 tokens

`border/subtle` — somewhere legitimate for the 28 stroke bindings currently squatting on
`fg/subtle`.
`fg/on-solid` — white on any solid semantic fill, instead of every family borrowing
`destructive/foreground`.

### Renamed as identity, not property — 30 tokens

`color/category/{name}/default` → `category/{name}/accent`, and `/surface` keeps its name.
These are exempt from property-first by Rule 2: the reader is choosing *home*, not *a
background*. `default` becomes `accent` because measurement shows these paint the icon
glyph and the identity dot — "default" was saying nothing.

---

## Net effect

| | before | after |
|---|---:|---:|
| Semantic colour tokens | 138 | **121** |
| Tokens whose name predicts their property | 0 | **121** |
| Tokens doing more than one job | 5 | **0** |
| Vocabularies for "background" | 4 | **1** |
| Families meaning "error" | 3 | **1** |

---

## What I need from you

1. **Approve or amend the convention** in `../docs/21-token-naming.md` — especially Rule 2
   (identity colours exempt) and Rule 4 (the closed ladder `subtle < muted < default < strong`).
2. **`color/income/foreground` is `#0e7490` — the same value as the brand cyan.** I think
   that is an accident rather than a decision. Confirm before I carry it into `fg/income-strong`.
3. **The 19 deletions.** Once applied they are gone; everything else is reversible.

Phase 1.2 does four things in one pass — rename, derive scopes from the property prefix,
generate `codeSyntax`, and write an intent description on every token — so it is worth
getting this file right before it runs.

---

# Ronda 2 — tras tu revisión del 2026-08-20

## Lo que aprobaste, aplicado al mapa

**Las 19 eliminaciones** quedan confirmadas (ahora 20 — ver abajo).

**`income` sale del cyan.** Confirmaste que compartir la escala de marca fue un accidente. No era
un token: eran los tres. `income/default` era cyan-600, `income/foreground` cyan-700 y
`income/surface` cyan-50 — la familia entera vivía sobre la marca.

Se muda a **green**, la única familia verde sin dueño (emerald es `provision`, teal es
`category/home`, lime es `category/insurance`). Está a 47° de matiz del cyan de marca.

| token | antes | ahora | contraste sobre blanco |
|---|---|---|---:|
| `fg/income` | `#0891b2` cyan-600 | `#15803d` green-700 | **5.02** ✅ AA |
| `fg/income-strong` | `#0e7490` cyan-700 | `#166534` green-800 | **7.13** ✅ AAA |
| `bg/income` | `#0891b2` cyan-600 | `#16a34a` green-600 | 3.30 ⚠️ |
| `bg/income-subtle` | `#ecfeff` cyan-50 | `#f0fdf4` green-50 | — |

⚠️ Texto blanco sobre `bg/income` da 3.30:1 — solo sirve en tamaño grande. Si un chip sólido de
ingresos necesita texto de cuerpo, el fondo tiene que bajar a green-700.

## Los dos cambios que pediste a la convención

**Regla 4 pasa de 4 peldaños a 6**, con el peldaño por defecto **sin sufijo** — así el token que
más se usa es el de nombre más corto (`bg/brand`, no `bg/brand-default`):

| | sufijo | primitiva típica | para qué |
|---:|---|---|---|
| 1 | `-subtlest` | `50` | lavado a nivel de página |
| 2 | `-subtle` | `100` | tinte de hover, fila seleccionada |
| 3 | `-muted` | `200` | relleno de chip y badge, divisor |
| 4 | *(ninguno)* | `500`-`600` | el sólido, la identidad del rol |
| 5 | `-strong` | `700` | texto sobre superficie clara |
| 6 | `-strongest` | `800`-`900` | contraste máximo |

Con una salvedad que añadí y que creo que importa más que los peldaños: **la escalera es un
vocabulario, no un inventario.** 6 peldaños × 6 roles × 4 propiedades serían 144 tokens que nadie
pidió, y acabamos de medir qué pasa cuando un token existe antes que su uso — 90 de 138 no los usa
nadie. Un peldaño nace cuando un diseño lo necesita; la regla solo obliga a que se llame por su
peldaño y no por un adjetivo nuevo.

**Regla 9, la escalera alpha.** Aquí hay una buena noticia que no esperaba: **las primitivas ya
tienen escalera de opacidad para cada tono** — `10 · 20 · 30 · 50 · 70 · 90` — desde hace tiempo.
Nunca se les hizo token semántico. Así que no invento peldaños, uso los que ya existen.

Y resulta que **cuatro tokens que ya usas son valores alpha con nombre de adjetivo**, lo cual
corrige un error de mi propia propuesta de ayer:

| token | valor | yo proponía | ahora |
|---|---|---|---|
| `color/overlay/brand` | cyan-500 @ 10% | `bg/brand-subtle` | **`bg/brand-alpha-10`** |
| `color/interactive/primary-overlay-subtle` | cyan-500 @ 20% | `bg/brand-muted` | **`bg/brand-alpha-20`** |
| `color/border/overlay-primary` | cyan-500 @ 50% | `border/brand` | **`border/brand-alpha-50`** |
| `color/account/border` | slate-500 @ 10% | `border/account` | **`border/neutral-alpha-10`** |

Ese último tiene **92 bindings de producto** — es el valor alpha más usado del archivo y nada en
su nombre lo decía.

El criterio de cuándo usar opaco y cuándo alpha quedó escrito en la Regla 9, porque es la parte
que se olvida: **opaco cuando sabes qué hay debajo y el texto necesita contraste garantizado;
alpha cuando lo de debajo es desconocido o es una capa que tiene que apilarse.** El caso que lo
decide: un hover sobre un chip de categoría **tiene** que ser alpha — un tinte opaco borraría la
categoría, que es lo único que ese chip existe para decir.

Alpha va, como pediste, para **brand** y **neutral** (slate), utilizables como `bg`, `border` y
overlay. Negro y blanco se quedan como primitivas: un scrim tiene un solo trabajo, así que se
llama `bg/scrim` y no lleva peldaño.

## Un token menos que reservar

`color/overlay/selected` tiene exactamente el mismo valor que `color/overlay/hover`. Estaba
reservando un duplicado, así que pasa a la lista de borrado — de 19 eliminaciones a **20**, y de
3 overlays reservados a **2**.

---

## Dos cosas que este cambio destapó y que necesitan tu decisión

### 1 · `provision` queda a 19° de `income`

Al mover income a verde, queda a 19° de matiz de `provision` (emerald-600). Y el resumen mensual
cuenta una sola historia — **ingresos → gastos → provisión → neto** — así que los cuatro
aparecen juntos casi seguro. 19° entre dos cifras positivas es poco.

**Propongo mover `provision` a teal-700** (`#0f766e`, contraste 5.47 sobre blanco). Eso da 33° de
separación en vez de 19°, y teal-700 está libre — lo ocupado es teal-600, por `category/home`.
Cuesta 20 bindings.

### 2 · `net` está a 11° de la marca

`net` es sky-600 (`#0284c7`, matiz 200°) y la marca es cyan-500 (`#06b6d4`, matiz 189°).

Es exactamente el mismo defecto que acabas de señalar en income, una familia más allá: **una
escala distinta de Tailwind no es un color distinto.** Sky-600 al lado del cyan de marca se lee
como marca.

No traigo recomendación aquí. `net` es la cifra principal de toda la app, así que su matiz es una
decisión de producto y no una limpieza. Lo dejo señalado mientras estamos dentro.

---

Con la convención aprobada, la fase 1.2 puede correr en cuanto decidas lo de `provision`. Aplica
las cuatro cosas en una sola pasada: renombrar, derivar los scopes del prefijo de propiedad,
generar `codeSyntax` y escribir la descripción de intención de cada token.

---

# Ronda 3 — income en azul, y net como la marca

## Income: green fuera, blue dentro

| token | ahora | contraste |
|---|---|---:|
| `fg/income` | `#1d4ed8` blue-700 | **6.70** sobre blanco |
| `fg/income-strong` | `#1e3a8a` blue-900 | **10.36** |
| `bg/income` | `#2563eb` blue-600 | **5.17** para texto blanco encima |
| `bg/income-subtle` | `#eff6ff` blue-50 | — |

Blue mejora lo que green no podía: el aviso que te di ayer — "texto blanco sobre `bg/income` solo
sirve en tamaño grande" — **desaparece**. Blue-600 pasa AA con texto de cuerpo.

Y de paso **se cae la pregunta de `provision`**: contra el azul (221°), emerald está a 60°, no a
los 19° que tenía contra el verde. Provision se queda donde está. Una decisión menos.

## Net como color de marca — tenía una objeción y la medición la mató

Mi objeción era esta: un matiz no puede significar a la vez *"esto se toca"* y *"esto es una
cifra"*. Si el cyan es el botón primario **y** el neto, el color deja de ser una señal fiable de
que algo es interactivo.

Fui a medir. `color/interactive/primary` tiene exactamente **18 bindings de texto**, convergido a
tres pasadas (18/18/18), y **los 18 son el mismo eyebrow de onboarding**:

| texto | bindings |
|---|---:|
| `PASO 1 DE 3` | 4 |
| `PASO 2 DE 3` | 8 |
| `PASO 3 DE 3` | 6 |

Ni un enlace. Ni un botón de texto. **El cyan en texto hoy no significa "tocable" en este
archivo**, así que no hay que renunciar a nada para que signifique "neto".

Fui también a ver dónde vive `bg/net`, que era el otro riesgo — un relleno cyan podía leerse como
botón. Son la **barra de `DistribucionCard`** (125×16), el **punto de la leyenda** (6×6), el swatch
del KPI y dos barras de contenedor. Es geometría de gráfico, no superficie de control. Un segmento
cyan junto al azul de income, el rojo de expense y el ámbar de tax no se lee como algo que se
pulsa: se lee como el total. Que es justo lo que quieres decir.

**Así que sí, y creo que es mejor que las dos opciones que te propuse.** Ninguna de ellas explicaba
por qué el número se llama como la app.

### Cómo lo implemento

`fg/net` **aliasa** a `fg/brand`, no lo reutiliza. Regla 7: trabajo distinto, token distinto,
mismo valor por alias. Si algún día quieres separarlos, cambias un valor en vez de volver a
enlazar 24 nodos.

### Tres condiciones

1. **Los 18 eyebrows salen del cyan**, a `fg/subtle`. Una vez que cyan significa neto, un
   `PASO 2 DE 3` en cyan es una señal falsa. Ese es el costo entero de la decisión: 18 bindings
   sobre tres cadenas de texto.
2. **`fg/brand` deja de existir como token de uso general.** Cuando los eyebrows se muevan, su
   único trabajo restante *es* la cifra de neto. Dos nombres para un trabajo es la Regla 7 al
   revés. No hay `fg/brand`: hay `fg/net`.
3. **Un neto negativo toma `fg/expense`.** Esto es lo que convierte la idea en una semántica de
   verdad y no en reutilización de color: el signo carga el significado, no el matiz. Y entonces
   el cyan de marca pasa a querer decir *"estás en positivo"*, que no es mala cosa para el color
   de marca de un planeador.

### Lo que se arregla solo

- **Se libera sky-600.** `category/work` deja de ser un duplicado de net.
- Los 11.7° entre net y la marca no se corrigen: **se disuelven**. Net ya no está *cerca* de la
  marca, *es* la marca. No queda nada que confundir.
- Con income en 221°, la paleta de dominio se separa limpiamente por primera vez: expense 0°,
  tax 43°, provision 161°, net/marca 189°, income 221°.
