# 09 — Breadcrumb

Estado: **creado en Figma, sin código todavía.** Pendiente de revisión de Alfredo antes de
abrir ticket a Dev.

Figma: página `Components · Navigation` (`302:10369`).
Sets: `breadcrumb-item` (`385:15243`) y `breadcrumb` (`385:15322`).

---

## 1. Por qué existe

No hay breadcrumb en `src/`. La app hoy navega por pestañas y por un sidebar, y ninguna
vista devuelve al usuario a su punto de partida por texto. En cuanto haya una segunda
capa —`Cuentas → Bancolombia → Movimiento`— la pestaña deja de decir dónde estás.

Este componente se crea **antes** de que exista el código, no después. Es la primera vez
en este proyecto que Figma va delante: hasta ahora el sistema de diseño venía
reconciliando lo que Dev ya había escrito. Aquí el SSOT nace en Figma y Dev lo implementa
desde la especificación, no al revés.

## 2. Anatomía

```
breadcrumb            (auto-layout horizontal, gap = breadcrumb/gap)
├── breadcrumb-item   Type=Link,    Show icon=true   ← la raíz, y solo la raíz, lleva ícono
├── Icon              chevron-right, size=XS         ← separator
├── breadcrumb-item   Type=Link
├── Icon              chevron-right
└── breadcrumb-item   Type=Current                   ← la página actual, no es enlace
```

`breadcrumb-item` a su vez:

```
item              (auto-layout horizontal, gap = breadcrumb/item/gap,
                   padding = item/padding-y × item/padding-x, radius = item/radius)
├── icon          instancia de Icon, size=S, oculta por defecto
└── label         texto, Body/Small (Link) o Body/Small-Emphasis (Current)
```

## 3. Propiedades

### `breadcrumb-item` — 4 variantes

| Prop | Valores | Nota |
|---|---|---|
| `Type` | `Link` \| `Current` | `Current` es `<span aria-current="page">`, no `<a>` |
| `State` | `Default` \| `Hover` \| `Focus` | solo para `Type=Link` |
| `Show icon` | boolean, default `false` | solo la migaja raíz lo enciende |
| `Label` | texto, default `Cuentas` | |

La matriz es **deliberadamente incompleta**: `Current` existe solo en `Default`. La página
actual no es interactiva, así que no tiene hover ni foco. Rellenar `Current/Hover` con una
copia de `Current/Default` habría completado la cuadrícula a costa de mentir sobre el
comportamiento.

### `breadcrumb` — 3 variantes

| Prop | Valores |
|---|---|
| `Levels` | `2` \| `3` \| `4` |

Más de 4 no está soportado. Si la ruta es más profunda, **colapsa los tramos intermedios
antes de llegar a este componente** — el breadcrumb no trunca solo, y no debería: decidir
qué tramo se esconde es una decisión de la vista, no del componente.

## 4. Tokens

15 variables nuevas en la colección **Components**, todas alias de **Primitives**, todas
con modo claro y oscuro.

| Token | Claro | Oscuro |
|---|---|---|
| `breadcrumb/item/foreground` | `slate/500` `#64748b` | `slate/400` `#94a3b8` |
| `breadcrumb/item/foreground-hover` | `slate/900` `#0f172a` | `slate/50` `#f8fafc` |
| `breadcrumb/item/background-hover` | `slate/500/10` | `slate/500/10` |
| `breadcrumb/current/foreground` | `slate/900` | `slate/50` |
| `breadcrumb/separator/foreground` | `slate/400` `#94a3b8` | `slate/500` `#64748b` |
| `breadcrumb/focus/ring` | `cyan/600` `#0891b2` | `cyan/500` `#06b6d4` |
| `breadcrumb/focus/ring-width` | `border-width/medium` 2 | idem |
| `breadcrumb/gap` | `spacing/4` 4 | idem |
| `breadcrumb/item/gap` | `spacing/4` 4 | idem |
| `breadcrumb/item/padding-x` | `spacing/4` 4 | idem |
| `breadcrumb/item/padding-y` | `spacing/2` 2 | idem |
| `breadcrumb/item/radius` | `radius/4` 4 | idem |
| `breadcrumb/icon/size` | `spacing/16` 16 | idem |
| `breadcrumb/separator/size` | `spacing/12` 12 | idem |
| `breadcrumb/height` | `spacing/24` 24 | idem |

Tres de estos números cargan una decisión que no se lee sola:

**`gap` es 4, no 8.** El item ya aporta 4px de `padding-x` a cada lado para alojar el
anillo de foco. Con `gap: 8` el hueco óptico entre etiqueta y chevron es 12px, y la fila
deja de leerse como una sola línea. Empecé en 8 y lo bajé después de mirarlo renderizado.

**`separator/size` es 12, no 16.** El chevron es puntuación, no contenido. A 16px —el
tamaño del ícono de casa— compite con las etiquetas.

**`separator/foreground` va exactamente un escalón por debajo de la etiqueta en cada
modo.** Claro: etiqueta `slate/500`, separador `slate/400`. Oscuro: etiqueta `slate/400`,
separador `slate/500`. El valor original era `slate/300` en claro, que da 1.6:1 contra
blanco y desaparece a 12px. No le exijo 3:1 —es decorativo, la jerarquía ya la comunica el
orden— pero sí que se vea.

## 5. Contraste

Medido contra `#ffffff` (claro) y `#020617` (oscuro).

| Par | Claro | Oscuro | Umbral |
|---|---|---|---|
| `item/foreground` sobre fondo | **4.76:1** | **7.9:1** | 4.5:1 (texto 14px) ✅ |
| `current/foreground` sobre fondo | **17.8:1** | **19.0:1** | 4.5:1 ✅ |
| `focus/ring` sobre fondo | **3.68:1** | **8.3:1** | 3:1 (componente UI) ✅ |
| `separator/foreground` sobre fondo | 2.57:1 | 4.24:1 | — decorativo |

El `item/foreground` claro pasa por 0.26. Si alguna vez el fondo de la barra deja de ser
blanco puro, este par se cae — es el primero que hay que volver a medir.

## 6. Dos decisiones que conviene conocer

### El `padding-x` de 4px no es decoración: es la caja del anillo de foco

El anillo va `OUTSIDE` con 2px. Sin padding horizontal, el anillo corta las letras
ascendentes y descendentes. Quien intente "limpiar" ese padding porque el item no tiene
fondo visible en reposo romperá el foco sin darse cuenta. Está escrito también en la
descripción del componente en Figma.

### El hover no lleva subrayado, y no fue una elección estética

Lo intenté. **Figma propaga `textDecoration` entre variantes de un mismo set cuando las
capas comparten nombre** — poner `UNDERLINE` en `State=Hover` lo puso en las cuatro
variantes; quitarlo de una lo quitó de las cuatro. Lo verifiqué tres veces, incluso por
`setRangeTextDecoration`, que propaga igual. Los `fills` **no** propagan, y por eso los
colores por estado sí funcionan.

Las salidas posibles eran renombrar la capa `label` en la variante Hover —lo que rompe la
continuidad de overrides al cambiar de variante— o expresar el hover de otra forma. Elegí
lo segundo: **fondo (`item/background-hover`) + `item/foreground-hover`**, que además es
lo que hace shadcn/ui y lo que justifica que `item/radius` e `item/padding-x` existan.

`background-hover` usa `color/slate/500/10`, un tinte con alfa: el **mismo alias sirve en
claro y oscuro** porque se apoya en la superficie que tenga debajo en lugar de fijar un
color. Es el único token de breadcrumb que no necesita dos valores.

No es una limitación que Dev herede: en CSS `text-decoration: underline` en `:hover` no
tiene ese problema. Si más adelante se decide que el subrayado sí hace falta, **es una
decisión de diseño, no de Figma** — y hay que anotarla aquí, porque Figma no podrá
mostrarla.

## 7. Qué le toca a Dev cuando se abra el ticket

- `src/components/navigation/Breadcrumb.tsx` + `BreadcrumbItem`
- Semántica: `<nav aria-label="Ruta">` → `<ol>` → `<li>`; enlaces `<a>`, actual
  `<span aria-current="page">`; los chevrons `aria-hidden`
- Los 15 tokens entran a `src/index.css` como `--breadcrumb-*` — **territorio de Dev**,
  yo los reporto, Dev los aplica
- `Body/Small` = `ts-body-small`; `Body/Small-Emphasis` = `ts-body-small-emphasis`
- El foco es `:focus-visible`, no `:focus` — no debe dispararse con el puntero

## 8. Lo que este documento no decide

- **Dónde se monta.** Qué vistas llevan breadcrumb y con qué rutas es decisión de
  producto, no del sistema de diseño.
- **La ruta raíz.** Puse `Inicio` con ícono de casa porque es la convención; si la app
  llama a esa vista de otra forma, cámbialo en el texto, no en el componente.
- **Truncado.** Ver §3.
