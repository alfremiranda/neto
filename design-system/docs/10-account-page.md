# 10 — AccountChart y AccountSummaryCard (página de cuenta)

Estado: **organizados en Figma. Sin ticket a Dev.** Hay tres decisiones abiertas (§5) y un
bloqueador que no es de diseño (§4).

Figma: página `Components · Cards` (`302:10368`).
Sets: `AccountChart` (`379:12672`), `AccountSummaryCard` (`379:12631`), ambos ya dentro de
su bloque `doc:` correspondiente.

---

## 1. Qué son

Alfredo los dibujó para una idea concreta: **cada cuenta pasa a tener su propia página.**
Arriba `AccountSummaryCard` —identidad, métricas, gráfico de 30 días—; abajo el contenedor
de movimientos que ya existe hoy en `CuentasView`.

`AccountSummaryCard` **no reemplaza a `AccountCard`**. Aquella es la ficha compacta y
seleccionable de la rejilla; ésta es la vista de detalle de una sola cuenta, y por eso
incluye el gráfico. Las dos conviven.

| | `AccountCard` | `AccountSummaryCard` |
|---|---|---|
| dónde | rejilla de `CuentasView` | cabecera de la página de una cuenta |
| tamaño | ~150–220px de ancho | 680px |
| selección | sí, es un control | no, ya estás dentro |
| gráfico | no | sí |

## 2. Qué encontré, y qué corregí

Lo primero, lo bueno: **los dos venían bien construidos.** Todos los textos con text
style, cero hex crudo, y `AccountSummaryCard` compone instancias reales de `Button`
(Outline/SM), `Separator`, `Icon` y del propio `AccountChart` — no copias. Eso es lo caro
de hacer bien y ya estaba hecho.

Lo corregido:

**Las series del gráfico tomaban prestados tokens ajenos.** El trazo principal usaba
`badge/primary/foreground` —un token de Badge— y la leyenda usaba `interactive/primary`:
dos fuentes distintas para el mismo color. La serie de deuda usaba `color/rose/600` crudo,
saltándose la capa de componente. Ahora hay seis tokens `account-chart/series/*` propios.
El color en pantalla no cambió; lo que cambió es que si Badge cambia de acento, el gráfico
ya no se mueve con él.

**La banda de deuda se pintaba dos veces.** En `Series=Dual`, el vector de la *línea* de
deuda llevaba además un degradado de relleno copiado del área. El grupo del saldo no lo
lleva. Le quité el relleno: la banda ahora tiene la opacidad que se diseñó, no el doble.

**Un degradado terminaba en el color equivocado.** La parada final del área de deuda
apuntaba a `cyan/500/0` en vez de `rose/500/0`. Invisible —alfa 0— hasta que alguien suba
esa opacidad.

**El eje X repetía una fecha.** Decía `1/7 · 25/7 · 10/7 · 15/7 · 20/7 · 25/7 · Hoy`. El
segundo tick debía ser `5/7`.

**`Property 1 = Default | Variant2`.** Ahora `Series = Single | Dual`, que es lo que la
propiedad significa: una serie o dos.

**79 capas con nombre genérico** (`Frame 3`, `Group 1`, `Details`, `Vector`, `Container`).
Renombradas a la anatomía real: `header / legend / plot / series-balance / series-debt /
area / line / marker / x-axis / tick`, y en la tarjeta `top / account-info / title-row /
identity / account-meta / metrics / metric / chart / divider`. Dos frames se llamaban
`Deuda actual` aunque contenían "Intereses" y "Saldo actual" — nombres heredados de un
copy-paste.

**`title` → `Title`**, por consistencia con el resto de propiedades del archivo.

## 3. Tokens

11 variables nuevas en **Components**, todas alias de **Primitives**, claro y oscuro.

| Token | Claro | Oscuro |
|---|---|---|
| `account-chart/series/balance/stroke` | `cyan/700` | `cyan/400` |
| `account-chart/series/balance/fill-from` | `cyan/500/50` | idem |
| `account-chart/series/balance/fill-to` | `cyan/500/0` | idem |
| `account-chart/series/debt/stroke` | `rose/600` | `rose/400` |
| `account-chart/series/debt/fill-from` | `rose/500/50` | idem |
| `account-chart/series/debt/fill-to` | `rose/500/0` | idem |
| `account-chart/axis/foreground` | `slate/500` | `slate/400` |
| `account-chart/marker/line` | `slate/500` | `white/70` |
| `account-summary-card/icon/foreground` | `purple/500` | `purple/400` |

Los degradados usan el mismo alias en ambos modos a propósito: son tintes con alfa, se
apoyan en la superficie que tengan debajo. La serie de deuda sí sube de `rose/600` a
`rose/400` en oscuro — `rose/600` sobre fondo oscuro pierde el rojo y se lee marrón.

**El tooltip no lleva tokens propios.** Es una instancia del componente `Tooltip`
compartido; creé `account-chart/tooltip/*` y los borré al darme cuenta. Un token que nadie
enlaza es peor que ninguno.

**Dos de estos duplican la capa semántica.** `axis/foreground` es exactamente
`foreground/subtle` y `marker/line` es exactamente `border/strong`. Los creé porque la
regla es que un componente nuevo tenga tokens propios en Components enlazados a
Primitives. Si prefieres que sigan a la capa semántica, se repuntan en un minuto — pero
entonces la regla necesita una excepción escrita, no una decisión caso por caso.

## 4. El bloqueador no es de diseño

Revisé el repo antes de escribir esto:

- **No hay router.** `react-router` no está en `package.json` y no hay `<Routes>` en
  ninguna parte. Las vistas cambian por estado: `uiStore.view` con `ViewType`, y `App.tsx`
  hace `{view === 'cuentas' && <CuentasView />}`. "Cada cuenta tiene su página" necesita o
  una vista nueva con un id de cuenta seleccionada, o meter un router. **Es una decisión de
  arquitectura, del orquestador y de Dev, no mía.**
- **d3 ya está instalado**, y `src/components/annual/TrendChart.tsx` ya dibuja un área con
  ejes y tooltip. `AccountChart` no necesita dependencia nueva: necesita reusar ese
  patrón. Es lo primero que debería leer quien lo implemente.
- **`AccountCardView.tsx` ya existe** y `CuentasView` ya renderiza tarjeta arriba +
  movimientos abajo para la cuenta seleccionada. La página de cuenta no parte de cero:
  parte de partir eso en dos.
- **Esto es lo que vuelve necesario el breadcrumb** que quedó listo ayer (`docs/09`).
  `Cuentas › CMR Falabella` es exactamente el caso de 2 niveles.

## 5. Tres decisiones abiertas

**a. El tooltip.** Figma lo dibuja como burbuja invertida (`surface/inverse`, fondo oscuro
en modo claro). `TrendChart` en el código lo dibuja con `--popover`: superficie del mismo
tono, borde, sombra, `rounded-xl`. Son dos lenguajes distintos para el mismo objeto. Hay
que elegir uno antes de implementar, o la app tendrá dos tipos de tooltip.

**b. El color del ícono de cuenta.** Figma lo pinta morado (`purple/500`) en los cuatro
tipos. `AccountCardView` lo pinta gris (`text-muted-foreground`). Dejé el token con el
morado que dibujaste, pero uno de los dos está desactualizado.

**c. `Bank Account` esconde "Intereses" pero muestra la tasa.** La variante oculta la
métrica secundaria y aun así su línea de meta dice `3.5% a.a. · ≈ COP 0,00/mes`. `Savings`
muestra las dos cosas. Puede ser intencional; no lo toqué.

## 6. Móvil — añadido después

`AccountChart` y `AccountSummaryCard` ganaron una segunda dimensión. **La propiedad se llama
`Device`, no `Breakpoint`.** Empecé llamándola `Breakpoint` y la renombré al ver que todo el
archivo ya usaba `Device`: `MonthNav`, `topnav`, `IncomeContainer`, `ExpenseContainer`,
`transferContainer`, `income-itemrow`, `outcome-itemrow`, `savings-itemrow`,
`transfer-itemrow`. Una convención que ya existe gana a una mejor inventada.

| Set | Antes | Ahora |
|---|---|---|
| `AccountChart` | `Series` (2) | `Series` × `Device` (4) |
| `AccountSummaryCard` | `Type` (4) | `Type` × `Device` (8) |

**AccountChart · Device=Mobile — 348 × 180.** 348 = 380 de tarjeta menos 16 de padding a cada
lado. Tres decisiones:

- **El eje pasa de 7 marcas a 4** — `1 · 10 · 20 · Hoy`, cada diez días. Siete etiquetas de
  11px en 348 píxeles son una empalizada; se leen como textura, no como fechas.
- **El tooltip pierde el año.** `13 Jul 2026` → `13 Jul`. En una ventana de 30 días el año
  siempre es el actual: es el token menos informativo de la cadena y el que más ancho cuesta.
- **El tooltip se despinó de `SCALE`.** Venía con constraints `SCALE/SCALE` heredadas del
  SVG; al reducir el ancho se habría estirado hasta deformarse. Ahora es `CENTER/MIN`.

**AccountSummaryCard · Device=Mobile — 380 × 371.** 380 = 412 de pantalla menos 16 de margen.
El padding baja de 20 a 16. Lo que en escritorio va en fila —identidad a la izquierda,
métricas a la derecha— se apila: identidad, botón Editar, y debajo las métricas repartidas a
los extremos con `SPACE_BETWEEN`. La métrica principal es `FILL` para que su texto quede
pegado al borde derecho **también cuando la secundaria está oculta**; sin eso, `Bank Account`
y `Cash` —las dos que esconden "Intereses"— dejaban el saldo caído a la izquierda.

El gráfico anidado cambia solo a `Device=Mobile`.

Dos cosas que me mordieron y quedan anotadas por si vuelven:

- **Un `COMPONENT_SET` con auto-layout estira lo que le metes.** Al hacer `appendChild` de las
  variantes móviles, el set (que estaba en `VERTICAL`) las redimensionó a su propio ancho:
  las ocho quedaron a 1116px. Hay que poner el set en `layoutMode = 'NONE'` antes de añadir,
  y volver a fijar el ancho de cada variante después.
- **Cuidado con `clipsContent` al cambiar de eje.** Al pasar `top` de `HORIZONTAL` a
  `VERTICAL` quedó con alto `FIXED` y recorte activo: la línea de meta y el botón Editar
  desaparecieron sin error ninguno. `HUG` + `clipsContent = false` en toda la cadena.

## 7. La página de flujo

Página nueva: **`Page - Accounts`**. Cuatro pantallas y dos flechas.

| | escritorio 1024 | móvil 412 |
|---|---|---|
| 1 · índice | Sidebar + topnav + rejilla de `AccountCard` | topnav + carrusel horizontal + bottom-nav |
| 2 · detalle | breadcrumb + `AccountSummaryCard` + movimientos | lo mismo, apilado |

Todo son instancias: `Sidebar`, `topnav`, `breadcrumb`, `AccountCard`, `AccountSummaryCard`,
`AccountChart`, `IncomeContainer`, `bottom-nav`. Nada dibujado a mano salvo los títulos de
página y los rótulos del flujo.

El carrusel móvil deja la tercera tarjeta asomando por el borde: es la misma decisión que ya
está en el código (`overflow-x-auto` con tarjetas al 46% del ancho), y ese asomo *es* la
señal de que hay más.

## 8. Lo que la página dejó al descubierto

**No existe un contenedor de movimientos.** En la maqueta usé `IncomeContainer` con el título
sobrescrito a "Movimientos" y el pie a "Saldo actual". Funciona como simulación y no como
entrega: el contenedor real de una cuenta mezcla ingresos, egresos y transferencias, y el
`LedgerRow` de `CuentasView` sigue sin componente en Figma. Son dos huecos, no uno:

1. `LedgerRow` — fila de movimiento con fecha, descripción, monto y saldo corrido.
2. Un contenedor que la aloje. Puede ser generalizar `IncomeContainer` —ya tiene `SLOT` y
   `Device`— en vez de crear un quinto contenedor casi idéntico.

Hasta que existan, la página de cuenta no se puede implementar completa por mucho que la
cabecera esté lista.

## 9. Lo que este documento no decide

Dónde vive la ruta, cómo se navega hasta ella, y si `CuentasView` conserva la rejilla de
tarjetas o se convierte en un índice. Todo eso es producto y arquitectura.
